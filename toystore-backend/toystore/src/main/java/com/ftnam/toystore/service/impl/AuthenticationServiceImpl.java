package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.configuration.OauthProperties;
import com.ftnam.toystore.dto.request.*;
import com.ftnam.toystore.dto.response.*;
import com.ftnam.toystore.entity.InvalidatedToken;
import com.ftnam.toystore.entity.RefreshTokenRedis;
import com.ftnam.toystore.entity.Role;
import com.ftnam.toystore.entity.User;
import com.ftnam.toystore.enums.Provider;
import com.ftnam.toystore.exception.AppException;
import com.ftnam.toystore.exception.ErrorCode;
import com.ftnam.toystore.mapper.UserMapper;
import com.ftnam.toystore.repository.*;
import com.ftnam.toystore.service.AuthenticationService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final RefreshTokenRedisRepository refreshTokenRedisRepository;
    private final RedisTemplate<Object,Object> redisTemplate;
    private final GoogleOAuthClient googleOAuthClient;
    private final FacebookOAuthClient facebookOAuthClient;
    private final OauthProperties oauthProperties;
    private final GoogleUserInfoClient googleUserInfoClient;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final FacebookUserInfoClient facebookUserInfoClient;


@Value("${jwt.signerKey}")
protected String SIGNER_KEY;

@Value("${jwt.valid-duration}")
protected Long VALID_DURATION;

@Value("${jwt.refreshable-duration}")
protected Long REFRESHABLE_DURATION;

    private static final String GRANT_TYPE = "authorization_code";
    


    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if(!authenticated){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Optional<RefreshTokenRedis> isHasRefreshToken =  refreshTokenRedisRepository.findById(user.getId());
        if(isHasRefreshToken.isPresent()){
            refreshTokenRedisRepository.deleteById(user.getId());
        }

        var accessToken = generateToken(user, false);
        var refreshToken = generateToken(user, true);

        RefreshTokenRedis refreshTokenRedis = new RefreshTokenRedis(user.getId(), refreshToken, REFRESHABLE_DURATION);
        refreshTokenRedisRepository.save(refreshTokenRedis);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public AuthenticationResponse authenticateWithGoogle(String code) {
        OauthProperties.OauthProvider provider = oauthProperties.getProvider("google");

        ExchangeTokenRequest request = ExchangeTokenRequest.builder()
                .code(code)
                .clientId(provider.getClientId())
                .clientSecret(provider.getClientSecret())
                .redirectUri(provider.getRedirectUri())
                .grantType(GRANT_TYPE)
                .build();

        log.info("Sending request to Google OAuth with code: {}", code);

        ExchangeTokenResponse response = googleOAuthClient.exchangeToken(request);

        log.info("Received access token: {}", response.getAccessToken());

        GoogleUserInfoResponse userInfo = googleUserInfoClient.getUserInfo("Bearer" + response.getAccessToken());

        User user = User.builder()
                .email(userInfo.getEmail())
                .firstname(userInfo.getName())
                .avatar(userInfo.getPicture())
                .provider(Provider.GOOGLE)
                .providerId(userInfo.getId())
                .build();

        Role customerRole = roleRepository.findById("CUSTOMER")
                .orElseThrow(() -> new AppException(ErrorCode.ID_NOT_EXISTED));

        user.setRoles(Set.of(customerRole));

        User userByEmail = userRepository.findByEmailAndProvider(userInfo.getEmail(), Provider.GOOGLE)
                .orElseGet(()-> userRepository.save(user));

        var accessToken = generateToken(userByEmail, false);
        var refreshToken = generateToken(userByEmail, true);

        RefreshTokenRedis refreshTokenRedis = new RefreshTokenRedis(userByEmail.getId(), refreshToken, REFRESHABLE_DURATION);
        refreshTokenRedisRepository.save(refreshTokenRedis);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public AuthenticationResponse authenticateWithFacebook(String code) {
        OauthProperties.OauthProvider provider = oauthProperties.getProvider("facebook");

        ExchangeTokenRequest request = ExchangeTokenRequest.builder()
                .code(code)
                .clientId(provider.getClientId())
                .clientSecret(provider.getClientSecret())
                .redirectUri(provider.getRedirectUri())
                .grantType(GRANT_TYPE)
                .build();

        log.info("Sending request to Facebook OAuth with code: {}", code);

        ExchangeTokenResponse response = facebookOAuthClient.exchangeToken(request);

        log.info("Received facebook access token: {}", response.getAccessToken());

        FacebookUserInfoResponse userInfoClient = facebookUserInfoClient.getUserInfo("Bearer " + response.getAccessToken());

        User user = User.builder()
                .firstname(userInfoClient.getName())
                .email(userInfoClient.getEmail())
                .provider(Provider.FACEBOOK)
                .providerId(userInfoClient.getId())
                .build();

        Role role = roleRepository.findById("CUSTOMER")
                .orElseThrow(() -> new AppException(ErrorCode.ID_NOT_EXISTED));

        user.setRoles(Set.of(role));

        User userByEmail = userRepository.findByEmailAndProvider(userInfoClient.getEmail(), Provider.FACEBOOK)
                .orElseGet(() -> userRepository.save(user));

        var accessToken = generateToken(userByEmail, false);
        var refreshToken = generateToken(userByEmail, true);

        RefreshTokenRedis refreshTokenRedis = new RefreshTokenRedis(userByEmail.getId(), refreshToken, REFRESHABLE_DURATION);
        refreshTokenRedisRepository.save(refreshTokenRedis);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedToken = verifyToken(request.getToken());
        String jit = signedToken.getJWTClaimsSet().getJWTID();
        Date expirationTime = signedToken.getJWTClaimsSet().getExpirationTime();

        var id = signedToken.getJWTClaimsSet().getSubject();

        Optional<RefreshTokenRedis> storedToken = refreshTokenRedisRepository.findById(Long.valueOf(id));
        if(storedToken.isEmpty() || !storedToken.get().getToken().equals(request.getToken()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        refreshTokenRedisRepository.deleteById(Long.valueOf(id));

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expirationTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);

        var user = userRepository.findById(Long.valueOf(id))
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        var accessToken = generateToken(user, false);
        var refreshToken = generateToken(user, true);

        refreshTokenRedisRepository.deleteById(Long.valueOf(id));
        RefreshTokenRedis refreshTokenRedis = new RefreshTokenRedis(Long.valueOf(id), refreshToken, REFRESHABLE_DURATION);
        refreshTokenRedisRepository.save(refreshTokenRedis);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        var signToken =verifyToken(request.getToken());
        String id = signToken.getJWTClaimsSet().getSubject();
        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expirationTime = signToken.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expirationTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
        refreshTokenRedisRepository.deleteById(Long.valueOf(id));
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier jwsVerifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(jwsVerifier);

        if(!(verified && expiryTime.after(new Date())))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if(invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private String generateToken(User user, boolean isRefreshToken){
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        long expirationTime = isRefreshToken ? REFRESHABLE_DURATION : VALID_DURATION;

        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(String.valueOf(user.getId()))
                .issuer("ftnam.com")
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(expirationTime, ChronoUnit.SECONDS)))
                .jwtID(UUID.randomUUID().toString());

        if(!isRefreshToken){
            claimsBuilder.claim("scope", buildScope(user));
        }

        JWTClaimsSet jwtClaimsSet = claimsBuilder.build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header,payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY));

            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cant not create token " + e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user){
        StringJoiner stringJoiner = new StringJoiner(" ");
        if(!CollectionUtils.isEmpty(user.getRoles())){
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if(!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });
        }
        return stringJoiner.toString();
    }
}

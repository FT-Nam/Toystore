package com.ftnam.toystore.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "outbound.identity")
public class OauthProperties {
    private Map<String, OauthProvider> providers;

    @Getter
    @Setter
    public static class OauthProvider {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }

    public OauthProvider getProvider(String provider){
        return providers.get(provider);
    }
}

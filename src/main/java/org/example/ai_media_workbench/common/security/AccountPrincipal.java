package org.example.ai_media_workbench.common.security;

import java.io.Serializable;
import java.security.Principal;

public record AccountPrincipal(String userId, String username) implements Principal, Serializable {
    @Override
    public String getName() { return userId; }
}

package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.service.SessionService;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.stereotype.Service;

@Service
public class SessionServiceImpl implements SessionService {
    private final JdbcIndexedSessionRepository sessionRepository;

    public SessionServiceImpl(JdbcIndexedSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Override
    public void revokeAll(String userId) {
        sessionRepository.findByPrincipalName(userId).keySet().forEach(sessionRepository::deleteById);
    }
}

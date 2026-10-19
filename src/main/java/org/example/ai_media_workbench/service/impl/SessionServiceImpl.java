package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.service.SessionService;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.stereotype.Service;

/** 通过 Spring Session 的用户索引撤销登录，无需自己拼接会话表 SQL。 */
@Service
public class SessionServiceImpl implements SessionService {
    private final JdbcIndexedSessionRepository sessionRepository;

    public SessionServiceImpl(JdbcIndexedSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    /** 删除指定用户的全部服务端登录会话。 */
    @Override
    public void revokeAll(String userId) {
        // 索引值来自 AccountPrincipal.getName()；删掉服务端会话后，设备持有的旧 Cookie 不再能恢复身份。
        sessionRepository.findByPrincipalName(userId).keySet().forEach(sessionRepository::deleteById);
    }
}

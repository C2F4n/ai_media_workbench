package org.example.ai_media_workbench.vo.system;

/** 仅声明已适配的模型，不表示当前凭据具备远程模型权限或余额。 */
public record AsrModelVO(String provider, String id, String name, boolean recommended) {}

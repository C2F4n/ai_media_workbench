package org.example.ai_media_workbench.common.security;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.*;
import java.security.SecureRandom;
import java.util.*;
import javax.crypto.Cipher;
import javax.crypto.spec.*;
import org.example.ai_media_workbench.common.exception.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** AES-256-GCM，随机96位nonce；AAD绑定账号/供应商，主密钥独立于数据库与Git保存。 */
@Component
public class CloudCredentialCipher {
    private final Path keyFile;
    private final SecureRandom random=new SecureRandom();
    public CloudCredentialCipher(@Value("${app.cloud-credentials.key-file}") String keyFile) { this.keyFile=Path.of(keyFile).toAbsolutePath().normalize(); }
    public String encrypt(String userId,String provider,String plaintext,boolean mayCreateKey) {
        try {
            byte[] iv=new byte[12]; random.nextBytes(iv);
            var cipher=Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE,key(mayCreateKey),new GCMParameterSpec(128,iv));
            cipher.updateAAD(aad(userId,provider)); byte[] encrypted=cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return "v1:"+Base64.getEncoder().encodeToString(ByteBuffer.allocate(iv.length+encrypted.length).put(iv).put(encrypted).array());
        } catch(Exception failure) { throw unavailable(); }
    }
    public String decrypt(String userId,String provider,String envelope) {
        try {
            if(envelope==null || !envelope.startsWith("v1:") || envelope.length()>8192) throw unavailable();
            byte[] data=Base64.getDecoder().decode(envelope.substring(3)); if(data.length<28) throw unavailable();
            var cipher=Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,key(false),new GCMParameterSpec(128,Arrays.copyOf(data,12))); cipher.updateAAD(aad(userId,provider));
            return new String(cipher.doFinal(data,12,data.length-12),StandardCharsets.UTF_8);
        } catch(Exception failure) { throw unavailable(); }
    }
    private synchronized SecretKeySpec key(boolean mayCreate) throws Exception {
        if(!Files.exists(keyFile,LinkOption.NOFOLLOW_LINKS)) {
            if(!mayCreate) throw unavailable();
            Files.createDirectories(keyFile.getParent(),privateAttributes(keyFile,true));
            byte[] generated=new byte[32]; random.nextBytes(generated);
            try {
                Files.createFile(keyFile,privateAttributes(keyFile,false));
                try(var output=Files.newOutputStream(keyFile,StandardOpenOption.WRITE,LinkOption.NOFOLLOW_LINKS)) { output.write(generated); }
            } catch(FileAlreadyExistsException anotherInstance) { /* 共享文件只由一个实例创建，其他实例随后读取。 */ }
            finally { Arrays.fill(generated,(byte)0); }
        }
        if(!Files.isRegularFile(keyFile,LinkOption.NOFOLLOW_LINKS)) throw unavailable();
        byte[] bytes;
        try(var input=Files.newInputStream(keyFile,LinkOption.NOFOLLOW_LINKS)) { bytes=input.readNBytes(33); }
        if(bytes.length!=32) throw unavailable();
        try { return new SecretKeySpec(bytes,"AES"); } finally { Arrays.fill(bytes,(byte)0); }
    }
    private static FileAttribute<?>[] privateAttributes(Path path,boolean directory) throws Exception {
        var views=path.getFileSystem().supportedFileAttributeViews();
        if(views.contains("posix")) return new FileAttribute<?>[]{PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString(directory ? "rwx------" : "rw-------"))};
        if(views.contains("acl")) {
            var owner=path.getFileSystem().getUserPrincipalLookupService().lookupPrincipalByName(System.getProperty("user.name"));
            var entry=AclEntry.newBuilder().setType(AclEntryType.ALLOW).setPrincipal(owner).setPermissions(EnumSet.allOf(AclEntryPermission.class)).build();
            return new FileAttribute<?>[]{new FileAttribute<List<AclEntry>>() {
                @Override public String name() { return "acl:acl"; }
                @Override public List<AclEntry> value() { return List.of(entry); }
            }};
        }
        throw unavailable();
    }
    private static byte[] aad(String userId,String provider) { return ("amw:cloud:v1:"+userId+":"+provider).getBytes(StandardCharsets.UTF_8); }
    private static BusinessException unavailable() { return new BusinessException(ErrorCode.CLOUD_CREDENTIALS_UNAVAILABLE); }
}

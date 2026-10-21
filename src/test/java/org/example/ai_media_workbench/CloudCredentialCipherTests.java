package org.example.ai_media_workbench;

import java.nio.file.*;
import java.nio.file.attribute.*;
import org.example.ai_media_workbench.common.security.CloudCredentialCipher;
import org.example.ai_media_workbench.common.exception.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import static org.assertj.core.api.Assertions.*;

class CloudCredentialCipherTests {
    @TempDir Path root;
    @Test void randomNoncesRoundTripAndAuthenticationBindsUserProviderAndCiphertext() throws Exception {
        Path file=root.resolve("private/key"); var cipher=new CloudCredentialCipher(file.toString());
        String first=cipher.encrypt("owner","deepseek","sk-private-value",true),second=cipher.encrypt("owner","deepseek","sk-private-value",false);
        assertThat(first).isNotEqualTo(second).doesNotContain("sk-private-value");
        assertThat(cipher.decrypt("owner","deepseek",first)).isEqualTo("sk-private-value");
        assertThatThrownBy(()->cipher.decrypt("another","deepseek",first)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->cipher.decrypt("owner","tencent",first)).isInstanceOf(BusinessException.class);
        String modified=first.substring(0,10)+(first.charAt(10)=='A' ? 'B' : 'A')+first.substring(11);
        assertThatThrownBy(()->cipher.decrypt("owner","deepseek",modified)).isInstanceOf(BusinessException.class);
        assertThat(Files.size(file)).isEqualTo(32);
        if(Files.getFileStore(file).supportsFileAttributeView(PosixFileAttributeView.class))
            assertThat(Files.getPosixFilePermissions(file)).containsExactlyInAnyOrder(PosixFilePermission.OWNER_READ,PosixFilePermission.OWNER_WRITE);
        else if(Files.getFileStore(file).supportsFileAttributeView(AclFileAttributeView.class)) {
            var acl=Files.getFileAttributeView(file,AclFileAttributeView.class);
            var owner=acl.getOwner();
            assertThat(acl.getAcl()).allMatch(entry->entry.type()!=AclEntryType.ALLOW || entry.principal().equals(owner));
        }
    }
    @Test void missingOrMalformedMasterKeyNeverRegeneratesOverExistingEncryptedData() throws Exception {
        Path file=root.resolve("key"); var cipher=new CloudCredentialCipher(file.toString());
        String encrypted=cipher.encrypt("owner","deepseek","secret",true); Files.delete(file);
        assertThatThrownBy(()->cipher.decrypt("owner","deepseek",encrypted)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->cipher.encrypt("owner","deepseek","new-secret",false)).isInstanceOf(BusinessException.class);
        assertThat(Files.exists(file)).isFalse(); Files.write(file,new byte[12]);
        assertThatThrownBy(()->cipher.encrypt("owner","deepseek","new-secret",true)).isInstanceOf(BusinessException.class);
        assertThat(Files.size(file)).isEqualTo(12);
    }
}

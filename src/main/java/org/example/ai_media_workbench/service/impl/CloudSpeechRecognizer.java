package org.example.ai_media_workbench.service.impl;

import java.net.URI;
import java.net.http.*;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.BooleanSupplier;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;
import org.example.ai_media_workbench.properties.AiProperties;
import org.example.ai_media_workbench.service.SpeechRecognizer;
import org.springframework.stereotype.Component;
import tools.jackson.databind.*;

/** 腾讯极速版 HTTP / 百炼 Paraformer WebSocket，直接传私有音频，不暴露素材下载地址。 */
@Component
public class CloudSpeechRecognizer implements SpeechRecognizer {
    private final org.example.ai_media_workbench.service.CloudCredentialService credentials;
    private final ObjectMapper json;
    private final Clock clock;
    private final CloudTransport transport;

    public CloudSpeechRecognizer(org.example.ai_media_workbench.service.CloudCredentialService credentials, ObjectMapper json, Clock clock, CloudTransport transport) {
        this.credentials=credentials; this.json=json; this.clock=clock; this.transport=transport;
    }
    @Override public List<String> providers(String userId) {
        var result=new ArrayList<String>();
        if (credentials.available(userId,"tencent")) result.add("tencent");
        if (credentials.available(userId,"aliyun")) result.add("aliyun");
        return List.copyOf(result);
    }
    @Override public boolean isAvailable(String provider,String userId) { return providers(userId).contains(provider); }
    @Override public List<RecognizedSegment> recognize(String provider, Path audio, Duration timeout, BooleanSupplier cancelled,String userId) {
        if(userId==null) throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        var properties=credentials.effective(userId,provider);
        if (!("tencent".equals(provider) && properties.tencentReady()) && !("aliyun".equals(provider) && properties.aliyunReady())) throw new BusinessException(ErrorCode.ASR_UNAVAILABLE);
        long deadline=System.nanoTime()+timeout.toNanos();
        CloudTransport.check(deadline,cancelled);
        try {
            if (Files.size(audio)<=0 || Files.size(audio)>100L*1024*1024) throw new BusinessException(ErrorCode.OUTPUT_TOO_LARGE);
            return provider.equals("tencent") ? tencent(audio,timeout,deadline,cancelled,properties) : aliyun(audio,deadline,cancelled,properties);
        } catch (BusinessException exception) { throw exception; }
        catch (Exception exception) { throw new BusinessException(ErrorCode.ASR_FAILED); }
    }
    private List<RecognizedSegment> tencent(Path audio, Duration timeout, long deadline, BooleanSupplier cancelled,AiProperties properties) throws Exception {
        var parameters=new TreeMap<String,String>();
        parameters.put("engine_type","16k_zh"); parameters.put("first_channel_only","1");
        parameters.put("secretid",properties.tencentSecretId()); parameters.put("timestamp",Long.toString(clock.instant().getEpochSecond()));
        parameters.put("voice_format","mp3"); parameters.put("word_info","3"); parameters.put("sentence_max_length","32");
        String query=parameters.entrySet().stream().map(entry->entry.getKey()+"="+entry.getValue()).collect(java.util.stream.Collectors.joining("&"));
        String address="asr.cloud.tencent.com/asr/flash/v1/"+properties.tencentAppId()+"?"+query;
        var request=HttpRequest.newBuilder(URI.create("https://"+address)).timeout(timeout)
                .header("Authorization",signature("POST"+address,properties.tencentSecretKey()))
                .header("Content-Type","application/octet-stream").POST(HttpRequest.BodyPublishers.ofFile(audio)).build();
        return tencentSegments(json.readTree(transport.post(request,deadline,cancelled,ErrorCode.ASR_FAILED)));
    }
    static String signature(String input, String secret) throws Exception {
        var mac=Mac.getInstance("HmacSHA1"); mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA1"));
        return Base64.getEncoder().encodeToString(mac.doFinal(input.getBytes(StandardCharsets.UTF_8)));
    }
    static List<RecognizedSegment> tencentSegments(JsonNode response) {
        if (!response.path("code").isIntegralNumber() || response.path("code").asInt()!=0) throw new BusinessException(ErrorCode.ASR_FAILED);
        var result=new ArrayList<RecognizedSegment>();
        if (!response.path("flash_result").isArray()) throw new BusinessException(ErrorCode.ASR_FAILED);
        for (var channel:response.path("flash_result")) {
            if (channel.path("channel_id").asInt(-1)!=0) continue;
            if (!channel.path("sentence_list").isArray()) throw new BusinessException(ErrorCode.ASR_FAILED);
            for (var sentence:channel.path("sentence_list")) add(result,sentence,"start_time","end_time");
        }
        return List.copyOf(result);
    }
    private List<RecognizedSegment> aliyun(Path audio,long deadline,BooleanSupplier cancelled,AiProperties properties) throws Exception {
        String workspace=properties.aliyunWorkspaceId();
        String host=workspace==null||workspace.isBlank() ? "dashscope.aliyuncs.com" : workspace+".cn-beijing.maas.aliyuncs.com";
        String taskId=UUID.randomUUID().toString();
        var listener=new RecognitionListener(taskId,json);
        var connecting=transport.client().newWebSocketBuilder().connectTimeout(Duration.ofSeconds(8))
                .header("Authorization","Bearer "+properties.aliyunApiKey())
                .buildAsync(URI.create("wss://"+host+"/api-ws/v1/inference"),listener);
        WebSocket socket=null;
        try {
            socket=CloudTransport.await(connecting,deadline,cancelled,ErrorCode.ASR_FAILED);
            var payload=Map.of("task_group","audio","task","asr","function","recognition","model","paraformer-realtime-v2",
                    "parameters",Map.of("format","mp3","sample_rate",16000,"language_hints",List.of("zh","en")),"input",Map.of());
            CloudTransport.await(socket.sendText(command("run-task",taskId,payload),true),deadline,cancelled,ErrorCode.ASR_FAILED);
            CloudTransport.await(listener.started,deadline,cancelled,ErrorCode.ASR_FAILED);
            try (var input=Files.newInputStream(audio)) {
                byte[] buffer=new byte[8192]; int count;
                while ((count=input.read(buffer))!=-1) {
                    if (listener.finished.isCompletedExceptionally()) CloudTransport.await(listener.finished,deadline,cancelled,ErrorCode.ASR_FAILED);
                    CloudTransport.await(socket.sendBinary(ByteBuffer.wrap(Arrays.copyOf(buffer,count)),true),deadline,cancelled,ErrorCode.ASR_FAILED);
                }
            }
            CloudTransport.await(socket.sendText(command("finish-task",taskId,Map.of("input",Map.of())),true),deadline,cancelled,ErrorCode.ASR_FAILED);
            CloudTransport.await(listener.finished,deadline,cancelled,ErrorCode.ASR_FAILED);
            return List.copyOf(listener.segments);
        } finally {
            if (socket!=null) socket.abort();
            else { connecting.thenAccept(WebSocket::abort); connecting.cancel(true); }
        }
    }
    private String command(String action,String id,Map<String,?> payload) {
        return json.writeValueAsString(Map.of("header",Map.of("action",action,"task_id",id,"streaming","duplex"),"payload",payload));
    }
    static void add(List<RecognizedSegment> result,JsonNode sentence,String start,String end) {
        if (!sentence.path("text").isString()) throw new BusinessException(ErrorCode.ASR_FAILED);
        String text=sentence.path("text").asText().strip();
        if (text.isBlank()) return;
        var startNode=sentence.path(start); var endNode=sentence.path(end);
        // 百炼的句尾时间可能为空：只回退到真实词时间戳，不推测时间轴。
        if (endNode.isNull() && sentence.path("words").isArray() && !sentence.path("words").isEmpty())
            endNode=sentence.path("words").get(sentence.path("words").size()-1).path("end_time");
        if (!startNode.isIntegralNumber() || !endNode.isIntegralNumber() || !startNode.canConvertToLong() || !endNode.canConvertToLong()
                || result.size()>=3000 || text.codePointCount(0,text.length())>2000) throw new BusinessException(ErrorCode.ASR_FAILED);
        result.add(new RecognizedSegment(startNode.asLong(),endNode.asLong(),text));
    }
    static final class RecognitionListener implements WebSocket.Listener {
        final CompletableFuture<Void> started=new CompletableFuture<>(), finished=new CompletableFuture<>();
        final List<RecognizedSegment> segments=new ArrayList<>();
        private final String id;
        private final ObjectMapper json;
        private final StringBuilder message=new StringBuilder();
        private long received;
        RecognitionListener(String id,ObjectMapper json) { this.id=id; this.json=json; }
        @Override public void onOpen(WebSocket socket) { socket.request(1); }
        @Override public CompletionStage<?> onText(WebSocket socket,CharSequence data,boolean last) {
            try {
                received+=data.length();
                if (received>4*1024*1024 || message.length()+data.length()>256*1024) throw new IllegalStateException("Cloud response limit");
                message.append(data);
                if (last) {
                    var event=json.readTree(message.toString()); message.setLength(0);
                    if (!id.equals(event.path("header").path("task_id").asText())) throw new IllegalStateException("Unexpected task");
                    switch (event.path("header").path("event").asText()) {
                        case "task-started" -> started.complete(null);
                        case "task-finished" -> finished.complete(null);
                        case "task-failed" -> throw new IllegalStateException("Cloud recognition failed");
                        case "result-generated" -> {
                            var sentence=event.path("payload").path("output").path("sentence");
                            if (sentence.path("sentence_end").asBoolean() && !sentence.path("heartbeat").asBoolean()) add(segments,sentence,"begin_time","end_time");
                        }
                        default -> throw new IllegalStateException("Unexpected recognition event");
                    }
                }
                socket.request(1);
            } catch (Exception exception) { fail(); socket.abort(); }
            return CompletableFuture.completedFuture(null);
        }
        private void fail() {
            var error=new IllegalStateException("Cloud recognition failed"); started.completeExceptionally(error); finished.completeExceptionally(error);
        }
        @Override public void onError(WebSocket socket,Throwable error) { fail(); }
        @Override public CompletionStage<?> onClose(WebSocket socket,int code,String reason) {
            if (!finished.isDone()) fail(); return CompletableFuture.completedFuture(null);
        }
    }
}

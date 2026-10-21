package org.example.ai_media_workbench.service.impl;

import java.util.List;
import java.util.Locale;
import org.example.ai_media_workbench.dto.transcript.TranscriptSegment;

/** 只序列化服务端固定ASS样式。渲染交给libass，用户文字中的覆盖标签和转义不生效。 */
public final class AssSubtitles {
    private AssSubtitles() {}
    public static String render(List<TranscriptSegment> segments,int width,int height) {
        int font=Math.max(12,(int)Math.round(height*0.045));
        int marginX=Math.max(4,width/20),marginY=Math.max(3,height/25);
        var out=new StringBuilder("[Script Info]\nScriptType: v4.00+\nWrapStyle: 0\nScaledBorderAndShadow: yes\n");
        out.append("PlayResX: ").append(width).append("\nPlayResY: ").append(height);
        out.append("\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n");
        out.append("Style: Default,sans-serif,").append(font).append(",&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,")
                .append(Math.max(1,font/18)).append(",0,2,").append(marginX).append(',').append(marginX).append(',').append(marginY).append(",1\n");
        out.append("\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n");
        for(var segment:segments) {
            // ASS时间精度为10ms，向外取整保留极短的真实字幕段。
            out.append("Dialogue: 0,").append(time(segment.startMs()/10)).append(',').append(time((segment.endMs()+9)/10))
                    .append(",Default,,0,0,0,,").append(literal(segment.text())).append('\n');
        }
        return out.toString();
    }
    private static String literal(String text) {
        // WORD JOINER阻断用户的\N/\h等转义；开括号单独转义，避免注入ASS覆盖标签。
        return text.replace("\\","\\\u2060").replace("{","\\{").replace("\t","    ").replace("\n","\\N");
    }
    private static String time(long cs) {
        return String.format(Locale.ROOT,"%d:%02d:%02d.%02d",cs/360000,cs/6000%60,cs/100%60,cs%100);
    }
}

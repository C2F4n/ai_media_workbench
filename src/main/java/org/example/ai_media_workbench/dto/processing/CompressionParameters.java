package org.example.ai_media_workbench.dto.processing;

public record CompressionParameters(String operation, String outputFormat, long targetSizeBytes,
                                    String resolutionPreset, String audioMode) implements VideoParameters {}

package org.example.ai_media_workbench.dto.processing;

public record TranscodeParameters(String operation, String outputFormat, String resolutionPreset, String audioMode) implements VideoParameters {}

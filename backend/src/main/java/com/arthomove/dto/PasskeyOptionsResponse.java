package com.arthomove.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PasskeyOptionsResponse {
    private JsonNode options;
    private String sessionToken;
}

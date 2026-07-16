from app.services.stream_protocol import encode_data, encode_finish, encode_text


def test_text_parts_use_code_0():
    line = encode_text("status")
    assert line.startswith('0:"')
    assert line.endswith("\n")


def test_data_parts_use_ai_sdk_code_2_array():
    line = encode_data({"type": "analysis", "summary": {}})
    assert line.startswith("2:[")
    assert '"type": "analysis"' in line
    assert line.endswith("\n")


def test_finish_uses_finish_reason_code_d():
    line = encode_finish()
    assert line.startswith("d:")
    assert "finishReason" in line

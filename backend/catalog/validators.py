from django.core.exceptions import ValidationError


def validate_string_list(value):
    if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
        raise ValidationError("This value must be a list of strings.")

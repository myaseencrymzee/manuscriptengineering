import os
import re
from django import template

register = template.Library()


def values_from_comma_separated_string(value):
    if not value:
        return ''
    try:
        result = [word.strip() for word in value.split(',')]
        return result
    except Exception as e:
        print(e)
        return ''
    

def comma_separated_string_from_list(value):
    if not value:
        return '--'
    try:
        return ', '.join(value) if value else '--'
    except Exception as e:
        print(e)
        return '--'


def show_locations(value):
    if not value:
        return '--'
    try:
        combined_list = [item for item in value.city] + [item for item in value.state] + [item for item in value.region] + [item for item in value.country]
        return ', '.join(combined_list) if combined_list else '--'
    except Exception as e:
        print(e)
        return '--'


def get_current_plan_name(value):
    if not value:
        return '--'
    try:
        return value.split(' ')[0]
    except Exception as e:
        print(e)
        return '--'

def format_filename(value, params):
    """
    Convert special characters and spaces to underscores.
    Truncate string to 35 characters (excluding extension) and append "...".
    Preserve and re-add the file extension at the end.
    """
    if not isinstance(value, str):
        return value

    # Extract file extension
    file_name, file_ext = os.path.splitext(value)

    f_name, f_ext = os.path.splitext(params)
    
    # Replace spaces and special characters with underscores
    formatted_name = re.sub(r'[^a-zA-Z0-9]', '_', file_name)

    # Truncate if necessary
    if len(formatted_name) > 35:
        formatted_name = formatted_name[:35] + "..."

    return formatted_name + f_ext




register.filter("values_from_comma_separated_string", values_from_comma_separated_string)
register.filter("show_locations", show_locations)
register.filter("comma_separated_string_from_list", comma_separated_string_from_list)
register.filter("get_current_plan_name", get_current_plan_name)
register.filter("format_filename", format_filename)
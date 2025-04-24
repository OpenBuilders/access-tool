import re

DIGIT_REPEATS_AT_LEAST_TWICE = re.compile(r"(\d)\1+")
DIGIT_REPEATS_AT_LEAST_THRICE = re.compile(r"(\d)\1{2,}")
DIGIT_REPEATS_AT_LEAST_FOURTH = re.compile(r"(\d)\1{3,}")
DIGIT_REPEATS_AT_LEAST_FIFTH = re.compile(r"(\d)\1{4,}")
DIGIT_IS_YEAR = re.compile(r"(19[0-9]{2}|20(0[0-9]|([12])[0-9]))")
DIGIT_IS_BINARY = re.compile(r"^[01]+$")

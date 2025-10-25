from setuptools import find_packages, setup

setup(
    name="access",
    version="2.0.0",
    description="Access Community Management Platform",
    author="danoctua",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
    ],
    entry_points={
        "console_scripts": [
            "index-gift-collection = indexer.cli.index_gift_collection:main",
            "index-gift-unique = indexer.cli.index_gift_unique:main",
        ]
    },
)

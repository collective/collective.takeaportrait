from setuptools import setup, find_packages
import os

version = '0.1.1.dev0'

setup(name='collective.takeaportrait',
      version=version,
      description="Plone site members can change personal portrait using a webcam",
      long_description=open("README.rst").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from
      # http://pypi.python.org/pypi?:action=list_classifiers
      classifiers=[
        "Development Status :: 3 - Alpha",
        "Framework :: Plone",
        "Framework :: Plone :: 4.3",
        "Programming Language :: Python",
        "Programming Language :: JavaScript",
        ],
      keywords='plone webcam portrait media-capture-api',
      author='keul',
      author_email='luca@keul.it',
      url='http://plone.org/products/collective.takeaportrait',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['collective'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'jarn.jsi18n',
      ],
      entry_points="""
      [z3c.autoinclude.plugin]
      target = plone
      """,
      )

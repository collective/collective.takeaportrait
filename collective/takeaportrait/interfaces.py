# -*- coding: utf8 -*-

from zope.interface import Interface


class ITakeAPortraitLayer(Interface):
    """Marker interface for collective.takeaportrait product layer"""


class IFaceDetection(Interface):
    """Marker interface for utility able to perform face detection"""

    def detect(img_buffer):
        """Given an image buffer, return the first face rect detected"""

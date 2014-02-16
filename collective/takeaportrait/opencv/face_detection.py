# -*- coding: utf8 -*-

import os
import tempfile
from zope.interface import implements
from collective.takeaportrait.interfaces import IFaceDetection
from collective.takeaportrait import logger


try:
    import cv2
    CV_AVAILABLE = True
except ImportError:
    CV_AVAILABLE = False
    logger.warning("opencv library not found but utility has been enabled someway")


def box(rects, image):
    """debug purpose"""
    for x1, y1, x2, y2 in rects:
        cv2.rectangle(image, (x1, y1), (x2, y2), (127, 255, 0), 2)
    cv2.imwrite('detected.jpg', image);

class OpenCVFaceDetectionUtility(object):
    implements(IFaceDetection)

    @classmethod
    def detect(cls, img_buffer):
        if not CV_AVAILABLE:
            return []
        # short way (problem while converting from string)
        # image = cv2.imdecode(bytearray(img_buffer), cv2.cv.CV_LOAD_IMAGE_COLOR)
        # long way (use temp file)
        with tempfile.NamedTemporaryFile(suffix='.jpg') as tmp:
            tmp.write(img_buffer)
            tmp.seek(0)
            image = cv2.imread(tmp.name)
        haar_path = os.path.join(os.path.dirname(__file__), "haarcascade_frontalface_alt.xml")
        cascade = cv2.CascadeClassifier(haar_path)
        rects = cascade.detectMultiScale(image, 1.3, 4, cv2.cv.CV_HAAR_SCALE_IMAGE, (20,20))

        if len(rects) == 0:
            logger.debug('No faces detected on given image')
            return []
        elif len(rects)>1:
            logger.warning('More that one faces detected on given image')
        rects[:, 2:] += rects[:, :2]
        # box(rects, image)
        return rects[0].tolist()


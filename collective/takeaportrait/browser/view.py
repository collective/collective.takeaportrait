# -*- coding: utf8 -*-

import base64
import json
from Products.CMFCore.utils import getToolByName
from StringIO import StringIO
from zope.publisher.browser import BrowserView
from zope.component import queryUtility
from ..interfaces import IFaceDetection


class UpdatePortraitView(BrowserView):
    """View for updating personal portrait photo"""

    def __call__(self, *args, **kwargs):
        form = self.request.form
        if form.get('image'):
            data = form['image'].split(',')[1]
            image = base64.decodestring(data)
            portrait = StringIO(image)
            portrait.filename = 'webcam_portrait.jpg'
            portrait.seek(0)
            mtool = getToolByName(self.context, 'portal_membership')
            mtool.changeMemberPortrait(portrait)

            response = self.request.response
            response.setHeader('Content-Type', 'text/plain')
            response.write(mtool.getAuthenticatedMember().getId())
        return ''


class FaceDetectionView(BrowserView):
    """A view able to perform server side face detection (if available)"""
    
    def __call__(self, *args, **kwargs):
        form = self.request.form
        response = self.request.response
        response.setHeader('Content-Type', 'application/json')
        fd_utility = queryUtility(IFaceDetection)
        if form.get('check_available'):
            response.write(json.dumps({'enabled': fd_utility is not None}))
        elif 'image' in form.keys() and fd_utility is not None:
            data = form['image'].split(',')[1]
            image = base64.decodestring(data)
            response.write(json.dumps({'position': fd_utility.detect(image)})) 

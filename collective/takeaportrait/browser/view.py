# -*- coding: utf8 -*-

import base64
from Products.CMFCore.utils import getToolByName
from zope.publisher.browser import BrowserView

from StringIO import StringIO

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
            response.write('DONE')

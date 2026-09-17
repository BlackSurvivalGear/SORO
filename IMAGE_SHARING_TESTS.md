# Image Sharing Stage 1A verification

## Static checks completed
- Branch starts from merged PR #11 main commit.
- Existing `app.js` is unchanged.
- Existing text message and reply code remains in place.
- Firestore message rules retain text/reply validation and add a separate image-only shape.
- Image message shape has no `text` or `replyTo` field.
- Client and Storage rules restrict images to JPEG, PNG, WebP and 5 MB.
- Storage path is scoped to the authenticated uploader UID.
- No Activity Log code was changed to record messages or images.

## Live checks required after merge/deployment
1. Publish `firestore.rules`.
2. Publish `storage.rules` in Firebase Storage.
3. Approved member: choose JPG/PNG/WebP <= 5 MB; preview appears; remove works.
4. Send one image; it appears in the room without a caption.
5. Tap/click image; enlarged viewer opens and closes.
6. Another approved account can view the image.
7. File > 5 MB is rejected before upload.
8. Unsupported file type is rejected.
9. Pending/rejected/suspended account cannot read/write image storage.
10. Existing text message send and reply still work.
11. Activity Log receives no image/message event.

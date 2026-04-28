import { describe, expect, it } from "bun:test";

import { createContainer } from "./create-container";

describe("bootstrap container", () => {
  it("wires media repository and filesystem storage ports", () => {
    const container = createContainer({
      MEDIA_CHAT_ROOT: "/tmp/chat",
      MEDIA_PHOTOS_ROOT: "/tmp/photos",
      NODE_ENV: "test",
    });

    expect(typeof container.chat.moderateUploadRetention.execute).toBe("function");
    expect(typeof container.chat.openUploadMedia.execute).toBe("function");
    expect(typeof container.chat.joinRoomSession?.execute).toBe("function");
    expect(typeof container.chat.listRoomMessages?.execute).toBe("function");
    expect(typeof container.chat.moderateRoomMessage?.execute).toBe("function");
    expect(typeof container.chat.banRoomHandle?.execute).toBe("function");
    expect(typeof container.chat.rotateRoomPassword?.execute).toBe("function");
    expect(typeof container.chat.sendRoomTextMessage?.execute).toBe("function");
    expect(typeof container.media.repository.findPhotoMediaById).toBe("function");
    expect(typeof container.media.repository.findChatUploadMediaById).toBe("function");
    expect(typeof container.media.storage.photos.openOriginal).toBe("function");
    expect(typeof container.media.storage.chatUploads.openUpload).toBe("function");
    expect(typeof container.media.storage.chatUploads.writeUpload).toBe("function");
    expect(typeof container.chat.uploadMessageWithImage.execute).toBe("function");
    expect(typeof container.auth?.loginWithCredentials.execute).toBe("function");
    expect(typeof container.auth?.resolveAdminSession.execute).toBe("function");
    expect(typeof container.auth?.refreshAdminSession.execute).toBe("function");
    expect(typeof container.auth?.logoutAdminSession.execute).toBe("function");
    expect(typeof container.auth?.verifyMfaChallenge.execute).toBe("function");
    expect(typeof container.admin?.getDashboardSummary.execute).toBe("function");
    expect(typeof container.admin?.listThoughts.execute).toBe("function");
    expect(typeof container.admin?.listProjects.execute).toBe("function");
    expect(typeof container.admin?.listPhotos.execute).toBe("function");
    expect(typeof container.admin?.listStatusStripEntries.execute).toBe("function");
    expect(typeof container.admin?.replaceStatusStripEntries.execute).toBe("function");
    expect(typeof container.admin?.updateThoughtCuration.execute).toBe("function");
    expect(typeof container.admin?.updateProjectCuration.execute).toBe("function");
    expect(typeof container.admin?.updatePhotoCuration.execute).toBe("function");
    expect(typeof container.admin?.updatePhotoMetadata.execute).toBe("function");
  });
});

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
    expect(typeof container.media.repository.findPhotoMediaById).toBe("function");
    expect(typeof container.media.repository.findChatUploadMediaById).toBe("function");
    expect(typeof container.media.storage.photos.openOriginal).toBe("function");
    expect(typeof container.media.storage.chatUploads.openUpload).toBe("function");
    expect(typeof container.media.storage.chatUploads.writeUpload).toBe("function");
    expect(typeof container.chat.uploadMessageWithImage.execute).toBe("function");
  });
});

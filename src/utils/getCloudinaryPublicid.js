const getPublicIdFromUrl = (url = "") => {
    if (!url) return "";

    try {
        const urlParts = url.split("/upload/");
        const publicIdWithVersion = urlParts[1]; // e.g. "v1750315247/p77hjjy9g3hchqgpdhuo.png"
        const withoutVersion = publicIdWithVersion.replace(/^v\d+\//, ""); // remove "v1234567890/"
        const publicId = withoutVersion.replace(/\.[^/.]+$/, ""); // remove ".png", ".mp4", etc.

        return publicId;
    } catch {
        return "";
    }
};


export {getPublicIdFromUrl}
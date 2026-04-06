import { memo } from "react";
import type { PostVisibility } from "../../lib/types";

interface PostComposerProps {
  composerContent: string;
  composerVisibility: PostVisibility;
  composerFile: File | null;
  composerBusy: boolean;
  composerError: string | null;
  onContentChange: (value: string) => void;
  onVisibilityChange: (value: PostVisibility) => void;
  onFileChange: (file: File | null) => void;
  onCreatePost: () => void;
}

function PostComposer({
  composerContent,
  composerVisibility,
  composerFile,
  composerBusy,
  composerError,
  onContentChange,
  onVisibilityChange,
  onFileChange,
  onCreatePost,
}: PostComposerProps) {
  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div className="_feed_inner_text_area_box_image">
          <img src="/buddy-script/assets/images/txt_img.png" alt="Image" className="_txt_img" />
        </div>
        <div className="form-floating _feed_inner_text_area_box_form">
          <textarea
            className="form-control _textarea"
            id="postComposer"
            placeholder="Leave a comment here"
            value={composerContent}
            onChange={(event) => onContentChange(event.target.value)}
          />
          <label className="_feed_textarea_label" htmlFor="postComposer">
            Write something ...
          </label>
        </div>
        <div className="composer-visibility-compact">
          <label htmlFor="composerVisibility" className="composer-visibility-label">
            Visibility
          </label>
          <select
            id="composerVisibility"
            className="composer-visibility-select"
            value={composerVisibility}
            onChange={(event) => onVisibilityChange(event.target.value as PostVisibility)}
            aria-label="Post visibility"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
      </div>

      <div className="_feed_inner_text_area_bottom">
        <div className="_feed_inner_text_area_item">
          <div className="_feed_inner_text_area_bottom_photo _feed_common">
            <label className="_feed_inner_text_area_bottom_photo_link">
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411z" />
                </svg>
              </span>
              Photo
              <input type="file" accept="image/*" hidden onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="_feed_inner_text_area_bottom_video _feed_common">
            <button type="button" className="_feed_inner_text_area_bottom_photo_link" title="Video posting coming soon">
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                  <path fill="#666" d="M11.485 4.5c2.213 0 3.753 1.534 3.917 3.784l2.418-1.082c1.047-.468 2.188.327 2.271 1.533l.005.141v6.64c0 1.237-1.103 2.093-2.155 1.72l-.121-.047-2.418-1.083c-.164 2.25-1.708 3.785-3.917 3.785H5.76c-2.343 0-3.932-1.72-3.932-4.188V8.688c0-2.47 1.589-4.188 3.932-4.188h5.726z" />
                </svg>
              </span>
              Video
            </button>
          </div>

          <div className="_feed_inner_text_area_bottom_event _feed_common">
            <button type="button" className="_feed_inner_text_area_bottom_photo_link" title="Event posting coming soon">
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                  <path fill="#666" d="M14.371 2c.32 0 .585.262.627.603l.005.095v.788c2.598.195 4.188 2.033 4.18 5v8.488c0 3.145-1.786 5.026-4.656 5.026H7.395C4.53 22 2.74 20.087 2.74 16.904V8.486c0-2.966 1.596-4.804 4.187-5v-.788c0-.386.283-.698.633-.698z" />
                </svg>
              </span>
              Event
            </button>
          </div>

          <div className="_feed_inner_text_area_bottom_article _feed_common">
            <button type="button" className="_feed_inner_text_area_bottom_photo_link" title="Article posting coming soon">
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" fill="none" viewBox="0 0 18 20">
                  <path fill="#666" d="M12.49 0c2.92 0 4.665 1.92 4.693 5.132v9.659c0 3.257-1.75 5.209-4.693 5.209H5.434c-.377 0-.734-.032-1.07-.095l-.2-.041C2 19.371.74 17.555.74 14.791V5.209c0-.334.019-.654.055-.96C1.114 1.564 2.799 0 5.434 0h7.056z" />
                </svg>
              </span>
              Article
            </button>
          </div>
        </div>

        <div className="_feed_inner_text_area_btn">
          <button type="button" className="_feed_inner_text_area_btn_link" onClick={onCreatePost} disabled={composerBusy}>
            <span>{composerBusy ? "Posting..." : "Post"}</span>
          </button>
        </div>
      </div>

      {composerFile ? <p className="_mar_t8 text-sm">Selected image: {composerFile.name}</p> : null}
      {composerError ? <p className="_mar_t8 text-sm text-rose-500">{composerError}</p> : null}
    </div>
  );
}

export default memo(PostComposer);

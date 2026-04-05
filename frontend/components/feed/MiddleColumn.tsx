type MiddleColumnProps = {
  showTimelineMenu: boolean;
  onToggleTimeline: () => void;
};

function StorySection() {
  return (
    <div className="_feed_inner_ppl_card _mar_b16">
      <div className="_feed_inner_story_arrow">
        <button type="button" className="_feed_inner_story_arrow_btn">
          &gt;
        </button>
      </div>
      <div className="row">
        {[1, 2, 3, 4].map((idx) => (
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col" key={idx}>
            <div className={idx === 1 ? "_feed_inner_profile_story _b_radious6" : "_feed_inner_public_story _b_radious6"}>
              <div className={idx === 1 ? "_feed_inner_profile_story_image" : "_feed_inner_public_story_image"}>
                <img src={`/buddy-script/assets/images/card_ppl${idx}.png`} alt="Image" className={idx === 1 ? "_profile_story_img" : "_public_story_img"} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComposerSection() {
  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div className="_feed_inner_text_area_box_image">
          <img src="/buddy-script/assets/images/txt_img.png" alt="Image" className="_txt_img" />
        </div>
        <div className="form-floating _feed_inner_text_area_box_form">
          <textarea className="form-control _textarea" placeholder="Leave a comment here" id="floatingTextarea" />
          <label className="_feed_textarea_label" htmlFor="floatingTextarea">
            Write something ...
          </label>
        </div>
      </div>
      <div className="_feed_inner_text_area_bottom">
        <div className="_feed_inner_text_area_item">
          {["Photo", "Video", "Event", "Article"].map((item) => (
            <div className="_feed_common" key={item}>
              <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                {item}
              </button>
            </div>
          ))}
        </div>
        <div className="_feed_inner_text_area_btn">
          <button type="button" className="_feed_inner_text_area_btn_link">
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

function PostCard({ showTimelineMenu, onToggleTimeline }: MiddleColumnProps) {
  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="/buddy-script/assets/images/post_img.png" alt="Image" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">Karim Saif</h4>
              <p className="_feed_inner_timeline_post_box_para">
                5 minute ago . <a href="#0">Public</a>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <button type="button" id="_timeline_show_drop_btn" className="_feed_timeline_post_dropdown_link" onClick={onToggleTimeline}>
              ...
            </button>
            <div id="_timeline_drop" className={`_feed_timeline_dropdown _timeline_dropdown ${showTimelineMenu ? "show" : ""}`}>
              <ul className="_feed_timeline_dropdown_list">
                <li className="_feed_timeline_dropdown_item"><a href="#0" className="_feed_timeline_dropdown_link">Save Post</a></li>
                <li className="_feed_timeline_dropdown_item"><a href="#0" className="_feed_timeline_dropdown_link">Turn On Notification</a></li>
                <li className="_feed_timeline_dropdown_item"><a href="#0" className="_feed_timeline_dropdown_link">Hide</a></li>
              </ul>
            </div>
          </div>
        </div>
        <h4 className="_feed_inner_timeline_post_title">-Healthy Tracking App</h4>
        <div className="_feed_inner_timeline_image">
          <img src="/buddy-script/assets/images/timeline_img.png" alt="Image" className="_time_img" />
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction">
        <button className="_feed_inner_timeline_reaction_emoji _feed_reaction _feed_reaction_active" type="button">
          <span className="_feed_inner_timeline_reaction_link">Haha</span>
        </button>
        <button className="_feed_inner_timeline_reaction_comment _feed_reaction" type="button">
          <span className="_feed_inner_timeline_reaction_link">Comment</span>
        </button>
        <button className="_feed_inner_timeline_reaction_share _feed_reaction" type="button">
          <span className="_feed_inner_timeline_reaction_link">Share</span>
        </button>
      </div>

      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <form className="_feed_inner_comment_box_form">
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <img src="/buddy-script/assets/images/comment_img.png" alt="Image" className="_comment_img" />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <textarea className="form-control _comment_textarea" placeholder="Write a comment" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MiddleColumn({ showTimelineMenu, onToggleTimeline }: MiddleColumnProps) {
  return (
    <div className="_layout_middle_wrap">
      <div className="_layout_middle_inner">
        <StorySection />
        <ComposerSection />
        <PostCard showTimelineMenu={showTimelineMenu} onToggleTimeline={onToggleTimeline} />
        <PostCard showTimelineMenu={showTimelineMenu} onToggleTimeline={onToggleTimeline} />
      </div>
    </div>
  );
}

export default function MiddleColumn() {
  return (
    <div className="_layout_middle_wrap">
      <div className="_layout_middle_inner">
        <div className="_feed_inner_ppl_card _mar_b16">
          <div className="_feed_inner_story_arrow">
            <button type="button" className="_feed_inner_story_arrow_btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
                <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
              </svg>
            </button>
          </div>
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
              <div className="_feed_inner_profile_story _b_radious6">
                <div className="_feed_inner_profile_story_image">
                  <img src="/buddy-script/assets/images/card_ppl1.png" alt="Image" className="_profile_story_img" />
                  <div className="_feed_inner_story_txt">
                    <div className="_feed_inner_story_btn">
                      <button className="_feed_inner_story_btn_link" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                          <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                        </svg>
                      </button>
                    </div>
                    <p className="_feed_inner_story_para">Your Story</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
              <div className="_feed_inner_public_story _b_radious6">
                <div className="_feed_inner_public_story_image">
                  <img src="/buddy-script/assets/images/card_ppl2.png" alt="Image" className="_public_story_img" />
                  <div className="_feed_inner_pulic_story_txt">
                    <p className="_feed_inner_pulic_story_para">Ryan Roslansky</p>
                  </div>
                  <div className="_feed_inner_public_mini">
                    <img src="/buddy-script/assets/images/mini_pic.png" alt="Image" className="_public_mini_img" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 _custom_mobile_none">
              <div className="_feed_inner_public_story _b_radious6">
                <div className="_feed_inner_public_story_image">
                  <img src="/buddy-script/assets/images/card_ppl3.png" alt="Image" className="_public_story_img" />
                  <div className="_feed_inner_pulic_story_txt">
                    <p className="_feed_inner_pulic_story_para">Ryan Roslansky</p>
                  </div>
                  <div className="_feed_inner_public_mini">
                    <img src="/buddy-script/assets/images/mini_pic.png" alt="Image" className="_public_mini_img" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 _custom_none">
              <div className="_feed_inner_public_story _b_radious6">
                <div className="_feed_inner_public_story_image">
                  <img src="/buddy-script/assets/images/card_ppl4.png" alt="Image" className="_public_story_img" />
                  <div className="_feed_inner_pulic_story_txt">
                    <p className="_feed_inner_pulic_story_para">Ryan Roslansky</p>
                  </div>
                  <div className="_feed_inner_public_mini">
                    <img src="/buddy-script/assets/images/mini_pic.png" alt="Image" className="_public_mini_img" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="_feed_inner_ppl_card_mobile _mar_b16">
          <div className="_feed_inner_ppl_card_area">
            <ul className="_feed_inner_ppl_card_area_list">
              <li className="_feed_inner_ppl_card_area_item">
                <a href="#0" className="_feed_inner_ppl_card_area_link">
                  <div className="_feed_inner_ppl_card_area_story">
                    <img src="/buddy-script/assets/images/mobile_story_img.png" alt="Image" className="_card_story_img" />
                    <div className="_feed_inner_ppl_btn">
                      <button className="_feed_inner_ppl_btn_link" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                          <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="_feed_inner_ppl_card_area_link_txt">Your Story</p>
                </a>
              </li>
              <li className="_feed_inner_ppl_card_area_item">
                <a href="#0" className="_feed_inner_ppl_card_area_link">
                  <div className="_feed_inner_ppl_card_area_story_active">
                    <img src="/buddy-script/assets/images/mobile_story_img1.png" alt="Image" className="_card_story_img1" />
                  </div>
                  <p className="_feed_inner_ppl_card_area_txt">Ryan...</p>
                </a>
              </li>
              <li className="_feed_inner_ppl_card_area_item">
                <a href="#0" className="_feed_inner_ppl_card_area_link">
                  <div className="_feed_inner_ppl_card_area_story_inactive">
                    <img src="/buddy-script/assets/images/mobile_story_img2.png" alt="Image" className="_card_story_img1" />
                  </div>
                  <p className="_feed_inner_ppl_card_area_txt">Ryan...</p>
                </a>
              </li>
              <li className="_feed_inner_ppl_card_area_item">
                <a href="#0" className="_feed_inner_ppl_card_area_link">
                  <div className="_feed_inner_ppl_card_area_story_active">
                    <img src="/buddy-script/assets/images/mobile_story_img1.png" alt="Image" className="_card_story_img1" />
                  </div>
                  <p className="_feed_inner_ppl_card_area_txt">Ryan...</p>
                </a>
              </li>
              <li className="_feed_inner_ppl_card_area_item">
                <a href="#0" className="_feed_inner_ppl_card_area_link">
                  <div className="_feed_inner_ppl_card_area_story_inactive">
                    <img src="/buddy-script/assets/images/mobile_story_img2.png" alt="Image" className="_card_story_img1" />
                  </div>
                  <p className="_feed_inner_ppl_card_area_txt">Ryan...</p>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
          <div className="_feed_inner_text_area_box">
            <div className="_feed_inner_text_area_box_image">
              <img src="/buddy-script/assets/images/txt_img.png" alt="Image" className="_txt_img" />
            </div>
            <div className="form-floating _feed_inner_text_area_box_form">
              <textarea className="form-control _textarea" placeholder="Leave a comment here" id="floatingTextarea" />
              <label className="_feed_textarea_label" htmlFor="floatingTextarea">
                Write something ...
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" fill="none" viewBox="0 0 23 24">
                  <path fill="#666" d="M19.504 19.209c.332 0 .601.289.601.646 0 .326-.226.596-.52.64l-.081.005h-6.276c-.332 0-.602-.289-.602-.645 0-.327.227-.597.52-.64l.082-.006h6.276zM13.4 4.417c1.139-1.223 2.986-1.223 4.125 0l1.182 1.268c1.14 1.223 1.14 3.205 0 4.427L9.82 19.649a2.619 2.619 0 01-1.916.85h-3.64c-.337 0-.61-.298-.6-.66l.09-3.941a3.019 3.019 0 01.794-1.982l8.852-9.5zm-.688 2.562l-7.313 7.85a1.68 1.68 0 00-.441 1.101l-.077 3.278h3.023c.356 0 .698-.133.968-.376l.098-.096 7.35-7.887-3.608-3.87zm3.962-1.65a1.633 1.633 0 00-2.423 0l-.688.737 3.606 3.87.688-.737c.631-.678.666-1.755.105-2.477l-.105-.124-1.183-1.268z" />
                </svg>
              </label>
            </div>
          </div>

          <div className="_feed_inner_text_area_bottom">
            <div className="_feed_inner_text_area_item">
              <div className="_feed_inner_text_area_bottom_photo _feed_common">
                <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                  <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                      <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411z" />
                    </svg>
                  </span>
                  Photo
                </button>
              </div>
              <div className="_feed_inner_text_area_bottom_video _feed_common">
                <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                  <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                      <path fill="#666" d="M11.485 4.5c2.213 0 3.753 1.534 3.917 3.784l2.418-1.082c1.047-.468 2.188.327 2.271 1.533l.005.141v6.64c0 1.237-1.103 2.093-2.155 1.72l-.121-.047-2.418-1.083c-.164 2.25-1.708 3.785-3.917 3.785H5.76c-2.343 0-3.932-1.72-3.932-4.188V8.688c0-2.47 1.589-4.188 3.932-4.188h5.726z" />
                    </svg>
                  </span>
                  Video
                </button>
              </div>
              <div className="_feed_inner_text_area_bottom_event _feed_common">
                <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                  <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                      <path fill="#666" d="M14.371 2c.32 0 .585.262.627.603l.005.095v.788c2.598.195 4.188 2.033 4.18 5v8.488c0 3.145-1.786 5.026-4.656 5.026H7.395C4.53 22 2.74 20.087 2.74 16.904V8.486c0-2.966 1.596-4.804 4.187-5v-.788c0-.386.283-.698.633-.698z" />
                    </svg>
                  </span>
                  Event
                </button>
              </div>
              <div className="_feed_inner_text_area_bottom_article _feed_common">
                <button type="button" className="_feed_inner_text_area_bottom_photo_link">
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
              <button type="button" className="_feed_inner_text_area_btn_link">
                <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                  <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
                </svg>
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>

        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
          <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
            <div className="_feed_inner_timeline_post_top">
              <div className="_feed_inner_timeline_post_box">
                <div className="_feed_inner_timeline_post_box_image">
                  <img src="/buddy-script/assets/images/post_img.png" alt="" className="_post_img" />
                </div>
                <div className="_feed_inner_timeline_post_box_txt">
                  <h4 className="_feed_inner_timeline_post_box_title">Karim Saif</h4>
                  <p className="_feed_inner_timeline_post_box_para">
                    5 minute ago . <a href="#0">Public</a>
                  </p>
                </div>
              </div>
              <div className="_feed_inner_timeline_post_box_dropdown">
                <div className="_feed_timeline_post_dropdown">
                  <button id="_timeline_show_drop_btn" className="_feed_timeline_post_dropdown_link" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                      <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                      <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                      <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <h4 className="_feed_inner_timeline_post_title">-Healthy Tracking App</h4>
            <div className="_feed_inner_timeline_image">
              <img src="/buddy-script/assets/images/timeline_img.png" alt="" className="_time_img" />
            </div>
          </div>

          <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
            <div className="_feed_inner_timeline_total_reacts_image">
              <img src="/buddy-script/assets/images/react_img1.png" alt="Image" className="_react_img1" />
              <img src="/buddy-script/assets/images/react_img2.png" alt="Image" className="_react_img" />
              <img src="/buddy-script/assets/images/react_img3.png" alt="Image" className="_react_img _rect_img_mbl_none" />
              <img src="/buddy-script/assets/images/react_img4.png" alt="Image" className="_react_img _rect_img_mbl_none" />
              <img src="/buddy-script/assets/images/react_img5.png" alt="Image" className="_react_img _rect_img_mbl_none" />
              <p className="_feed_inner_timeline_total_reacts_para">9+</p>
            </div>
            <div className="_feed_inner_timeline_total_reacts_txt">
              <p className="_feed_inner_timeline_total_reacts_para1">
                <a href="#0">
                  <span>12</span> Comment
                </a>
              </p>
              <p className="_feed_inner_timeline_total_reacts_para2">
                <span>122</span> Share
              </p>
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
                    <img src="/buddy-script/assets/images/comment_img.png" alt="" className="_comment_img" />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea className="form-control _comment_textarea" placeholder="Write a comment" id="floatingTextarea2" />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="_timline_comment_main">
            <div className="_previous_comment">
              <button type="button" className="_previous_comment_txt">View 4 previous comments</button>
            </div>
            <div className="_comment_main">
              <div className="_comment_image">
                <a href="#0" className="_comment_image_link">
                  <img src="/buddy-script/assets/images/txt_img.png" alt="" className="_comment_img1" />
                </a>
              </div>
              <div className="_comment_area">
                <div className="_comment_details">
                  <h4 className="_comment_details_title">Radovan SkillArena</h4>
                  <p className="_comment_details_para">
                    It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                  </p>
                </div>
                <div className="_comment_reacts">
                  <a href="#0">Like.</a> <a href="#0">Reply.</a> <a href="#0">Share.</a> <span>21m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

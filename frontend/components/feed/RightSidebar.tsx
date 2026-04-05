import { feedPeople } from "./feed-data";

export default function RightSidebar() {
  return (
    <div className="_layout_right_sidebar_wrap">
      <div className="_layout_right_sidebar_inner">
        <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_right_inner_area_info_content _mar_b24">
            <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
            <span className="_right_inner_area_info_content_txt">
              <a className="_right_inner_area_info_content_txt_link" href="#0">
                See All
              </a>
            </span>
          </div>
          <hr className="_underline" />
          <div className="_right_inner_area_info_ppl">
            <div className="_right_inner_area_info_box">
              <div className="_right_inner_area_info_box_image">
                <img src="/buddy-script/assets/images/Avatar.png" alt="Image" className="_ppl_img" />
              </div>
              <div className="_right_inner_area_info_box_txt">
                <h4 className="_right_inner_area_info_box_title">Radovan SkillArena</h4>
                <p className="_right_inner_area_info_box_para">Founder & CEO at Trophy</p>
              </div>
            </div>
            <div className="_right_info_btn_grp">
              <button type="button" className="_right_info_btn_link">Ignore</button>
              <button type="button" className="_right_info_btn_link _right_info_btn_link_active">Follow</button>
            </div>
          </div>
        </div>
      </div>

      <div className="_layout_right_sidebar_inner">
        <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_feed_top_fixed">
            <div className="_feed_right_inner_area_card_content _mar_b24">
              <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
              <span className="_right_inner_area_info_content_txt">
                <a className="_right_inner_area_info_content_txt_link" href="#0">
                  See All
                </a>
              </span>
            </div>
            <form className="_feed_right_inner_area_card_form">
              <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                <circle cx="7" cy="7" r="6" stroke="#666" />
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
              </svg>
              <input className="form-control me-2 _feed_right_inner_area_card_form_inpt" type="search" placeholder="input search text" aria-label="Search" />
            </form>
          </div>

          <div className="_feed_bottom_fixed">
            {Array.from({ length: 8 }).map((_, idx) => {
              const person = feedPeople[idx % feedPeople.length];
              const inactive = idx % 3 === 0;
              return (
                <div className={`_feed_right_inner_area_card_ppl ${inactive ? "_feed_right_inner_area_card_ppl_inactive" : ""}`} key={idx}>
                  <div className="_feed_right_inner_area_card_ppl_box">
                    <div className="_feed_right_inner_area_card_ppl_image">
                      <img src={`/buddy-script/assets/images/${person.image}`} alt="Image" className="_box_ppl_img" />
                    </div>
                    <div className="_feed_right_inner_area_card_ppl_txt">
                      <h4 className="_feed_right_inner_area_card_ppl_title">{person.name}</h4>
                      <p className="_feed_right_inner_area_card_ppl_para">{person.role}</p>
                    </div>
                  </div>
                  <div className="_feed_right_inner_area_card_ppl_side">
                    {inactive ? <span>5 minute ago</span> : <span className="_online_dot" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const people = [
  { name: "Steve Jobs", role: "CEO of Apple", image: "people1.png" },
  { name: "Ryan Roslansky", role: "CEO of Linkedin", image: "people2.png" },
  { name: "Dylan Field", role: "CEO of Figma", image: "people3.png" },
];

const explore = ["Learning", "Insights", "Find friends", "Bookmarks", "Group", "Gaming", "Settings", "Save post"];

export default function LeftSidebar() {
  return (
    <div className="_layout_left_sidebar_wrap">
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
          <ul className="_left_inner_area_explore_list">
            {explore.map((item) => (
              <li className="_left_inner_area_explore_item" key={item}>
                <a href="#0" className="_left_inner_area_explore_link">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_area_suggest_content _mar_b24">
            <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
            <span className="_left_inner_area_suggest_content_txt">
              <a className="_left_inner_area_suggest_content_txt_link" href="#0">
                See All
              </a>
            </span>
          </div>
          {people.map((person) => (
            <div className="_left_inner_area_suggest_info" key={person.name}>
              <div className="_left_inner_area_suggest_info_box">
                <div className="_left_inner_area_suggest_info_image">
                  <img src={`/buddy-script/assets/images/${person.image}`} alt="Image" className="_info_img" />
                </div>
                <div className="_left_inner_area_suggest_info_txt">
                  <h4 className="_left_inner_area_suggest_info_title">{person.name}</h4>
                  <p className="_left_inner_area_suggest_info_para">{person.role}</p>
                </div>
              </div>
              <div className="_left_inner_area_suggest_info_link">
                <a href="#0" className="_info_link">
                  Connect
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_event_content">
            <h4 className="_left_inner_event_title _title5">Events</h4>
            <a href="#0" className="_left_inner_event_link">
              See all
            </a>
          </div>
          {[1, 2].map((n) => (
            <a className="_left_inner_event_card_link" href="#0" key={n}>
              <div className="_left_inner_event_card">
                <div className="_left_inner_event_card_iamge">
                  <img src="/buddy-script/assets/images/feed_event1.png" alt="Image" className="_card_img" />
                </div>
                <div className="_left_inner_event_card_content">
                  <div className="_left_inner_card_date">
                    <p className="_left_inner_card_date_para">10</p>
                    <p className="_left_inner_card_date_para1">Jul</p>
                  </div>
                  <div className="_left_inner_card_txt">
                    <h4 className="_left_inner_event_card_title">No more terrorism no more cry</h4>
                  </div>
                </div>
                <hr className="_underline" />
                <div className="_left_inner_event_bottom">
                  <p className="_left_iner_event_bottom">17 People Going</p>
                  <span className="_left_iner_event_bottom_link">Going</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

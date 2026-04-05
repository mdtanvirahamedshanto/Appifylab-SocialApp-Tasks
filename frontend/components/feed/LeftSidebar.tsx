import { feedPeople } from "./feed-data";

const exploreItems = [
  { label: "Learning", href: "#0", isNew: true },
  { label: "Insights", href: "#0" },
  { label: "Find friends", href: "#0" },
  { label: "Bookmarks", href: "#0" },
  { label: "Group", href: "#0" },
  { label: "Gaming", href: "#0", isNew: true },
  { label: "Settings", href: "#0" },
  { label: "Save post", href: "#0" },
];

function ExploreIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
      <path fill="#666" d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm0 1.395a8.605 8.605 0 100 17.21 8.605 8.605 0 000-17.21z" />
    </svg>
  );
}

export default function LeftSidebar() {
  return (
    <div className="_layout_left_sidebar_wrap">
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
          <ul className="_left_inner_area_explore_list">
            {exploreItems.map((item) => (
              <li className={`_left_inner_area_explore_item ${item.isNew ? "_explore_item" : ""}`} key={item.label}>
                <a href={item.href} className="_left_inner_area_explore_link">
                  <ExploreIcon />
                  {item.label}
                </a>
                {item.isNew ? <span className="_left_inner_area_explore_link_txt">New</span> : null}
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
          {feedPeople.map((person) => (
            <div className="_left_inner_area_suggest_info" key={person.name}>
              <div className="_left_inner_area_suggest_info_box">
                <div className="_left_inner_area_suggest_info_image">
                  <a href="#0">
                    <img src={`/buddy-script/assets/images/${person.image}`} alt="Image" className="_info_img" />
                  </a>
                </div>
                <div className="_left_inner_area_suggest_info_txt">
                  <a href="#0">
                    <h4 className="_left_inner_area_suggest_info_title">{person.name}</h4>
                  </a>
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

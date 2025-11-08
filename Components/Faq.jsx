import React from "react";

const Faq = () => {
  return (
    <>
      <section id="faq" className="faq pos-rel pt-140 pb-105">
        <div className="container">
          <div className="sec-title text-center">
            <h5 className="sec-title__subtitle"> FAQ</h5>
            <h2 className="sec-title__title">Frequently Asked Questions</h2>
          </div>

          <div className="faq__wrap">
            <ul className="accordion_box clearfix">
              <li className="accordion block active-block">
                <div className="acc-btn">
                  <span>QA: 01</span> What is Arc?
                </div>
                <div className="acc_body current">
                  <div className="content">
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Pariatur a architecto distinctio quia quas aspernatur ex
                      consequuntur accusantium amet repellat.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="faq__sec-shape">
          <div className="shape shape-1">
            <img src="assets/img/shape/s_shape1.png" alt="" />
          </div>
          <div className="shape shape-2">
            <img src="assets/img/shape/s_shape2.png" alt="" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Faq;

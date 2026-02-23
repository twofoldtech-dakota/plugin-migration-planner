import { C as ChallengeReviewPage } from './ChallengeReviewPage-DT8xsqJW.js';
import './index4-DG1itRH8.js';
import './Card-w7RlWvYA.js';
import './Badge-CWejdkwM.js';
import './Tooltip-hZ63yG7F.js';
import './index-server-CVwIEJCx.js';
import './Tabs-CIZXvs-S.js';
import './ConfidenceGauge-CfeVxdrW.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    ChallengeReviewPage($$renderer2, {
      step: "discovery",
      stepLabel: "Discovery",
      reviews: data.reviews,
      assessmentId: data.assessment?.id ?? ""
    });
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BdksL_bK.js.map

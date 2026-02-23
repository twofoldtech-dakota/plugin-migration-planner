const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["apple-touch-icon.png","favicon.png","favicon.svg","og-image.png"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.ChRfczwS.js",app:"_app/immutable/entry/app.XdTL5gQw.js",imports:["_app/immutable/entry/start.ChRfczwS.js","_app/immutable/chunks/5_lFXlvf.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/entry/app.XdTL5gQw.js","_app/immutable/chunks/DcamcR-f.js","_app/immutable/chunks/Nq2m2xDw.js","_app/immutable/chunks/DsmKcCbW.js","_app/immutable/chunks/tZfpQL7D.js","_app/immutable/chunks/DwGCDbOQ.js","_app/immutable/chunks/jfJYy30P.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-B_nE4dKU.js')),
			__memo(() => import('./chunks/1-DJ4M4920.js')),
			__memo(() => import('./chunks/2-DEjGpzL-.js')),
			__memo(() => import('./chunks/3-C2xw70_H.js')),
			__memo(() => import('./chunks/4-CSHOK6by.js')),
			__memo(() => import('./chunks/5-SVRcoWb4.js')),
			__memo(() => import('./chunks/6-B8_IU5f9.js')),
			__memo(() => import('./chunks/7-DtTUh0OK.js')),
			__memo(() => import('./chunks/8-C2cUKNcl.js')),
			__memo(() => import('./chunks/9-BxhsVMGp.js')),
			__memo(() => import('./chunks/10-D7vjixFK.js')),
			__memo(() => import('./chunks/11-BnNvhIau.js')),
			__memo(() => import('./chunks/12-C0tHXhYa.js')),
			__memo(() => import('./chunks/13-kzsRY3fV.js')),
			__memo(() => import('./chunks/14-44eED6fa.js')),
			__memo(() => import('./chunks/15-gbwwT2a2.js')),
			__memo(() => import('./chunks/16-DCOV3-0p.js')),
			__memo(() => import('./chunks/17-0S5FBc8S.js')),
			__memo(() => import('./chunks/18-hx2wRumt.js')),
			__memo(() => import('./chunks/19-B1hDyIzx.js')),
			__memo(() => import('./chunks/20-CgEb2vcJ.js')),
			__memo(() => import('./chunks/21-Di0M7sLN.js')),
			__memo(() => import('./chunks/22-uoZI6I1h.js')),
			__memo(() => import('./chunks/23-pdC2POhK.js')),
			__memo(() => import('./chunks/24-BkT9Uhzo.js')),
			__memo(() => import('./chunks/25-CAA9VRQK.js')),
			__memo(() => import('./chunks/26-DvGmG9Rt.js')),
			__memo(() => import('./chunks/27-DQK0n-4a.js')),
			__memo(() => import('./chunks/28-CN28VHdo.js')),
			__memo(() => import('./chunks/29-ZnoDc77m.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/analytics",
				pattern: /^\/analytics\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/analytics/calibration",
				pattern: /^\/analytics\/calibration\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/analytics/confidence",
				pattern: /^\/analytics\/confidence\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/analytics/estimates",
				pattern: /^\/analytics\/estimates\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/analytics/knowledge",
				pattern: /^\/analytics\/knowledge\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/analytics/portfolio",
				pattern: /^\/analytics\/portfolio\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/analytics/usage",
				pattern: /^\/analytics\/usage\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/api/analytics/events",
				pattern: /^\/api\/analytics\/events\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CoC3_WHo.js'))
			},
			{
				id: "/api/assessments",
				pattern: /^\/api\/assessments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DDpfOiYl.js'))
			},
			{
				id: "/api/assessments/[id]/ai-selections",
				pattern: /^\/api\/assessments\/([^/]+?)\/ai-selections\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CWF9T7sV.js'))
			},
			{
				id: "/api/assessments/[id]/assumptions/[assumptionId]",
				pattern: /^\/api\/assessments\/([^/]+?)\/assumptions\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"assumptionId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CY7syteD.js'))
			},
			{
				id: "/api/assessments/[id]/component-refinements",
				pattern: /^\/api\/assessments\/([^/]+?)\/component-refinements\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CF5o1suI.js'))
			},
			{
				id: "/api/assessments/[id]/deliverables",
				pattern: /^\/api\/assessments\/([^/]+?)\/deliverables\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DFpYcKRR.js'))
			},
			{
				id: "/api/assessments/[id]/discovery",
				pattern: /^\/api\/assessments\/([^/]+?)\/discovery\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-_Hm-RoxN.js'))
			},
			{
				id: "/api/assessments/[id]/estimate-versions",
				pattern: /^\/api\/assessments\/([^/]+?)\/estimate-versions\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-0mpg9yUH.js'))
			},
			{
				id: "/api/assessments/[id]/finalize",
				pattern: /^\/api\/assessments\/([^/]+?)\/finalize\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BVxuzHc-.js'))
			},
			{
				id: "/api/assessments/[id]/scope-exclusions",
				pattern: /^\/api\/assessments\/([^/]+?)\/scope-exclusions\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BLy8fFsK.js'))
			},
			{
				id: "/api/clients",
				pattern: /^\/api\/clients\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DyPo_Fgm.js'))
			},
			{
				id: "/api/clients/[id]",
				pattern: /^\/api\/clients\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-3Tjp0KhU.js'))
			},
			{
				id: "/api/clients/[id]/proficiencies",
				pattern: /^\/api\/clients\/([^/]+?)\/proficiencies\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-cyuCMLZ2.js'))
			},
			{
				id: "/api/knowledge/[id]/research",
				pattern: /^\/api\/knowledge\/([^/]+?)\/research\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DCAxVaGl.js'))
			},
			{
				id: "/api/planning/team",
				pattern: /^\/api\/planning\/team\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CuHJkOmm.js'))
			},
			{
				id: "/api/planning/team/export",
				pattern: /^\/api\/planning\/team\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-YllWGx8Z.js'))
			},
			{
				id: "/api/planning/team/roles",
				pattern: /^\/api\/planning\/team\/roles\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BHz5qtC5.js'))
			},
			{
				id: "/api/planning/team/roles/[roleId]",
				pattern: /^\/api\/planning\/team\/roles\/([^/]+?)\/?$/,
				params: [{"name":"roleId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CRBOYNxm.js'))
			},
			{
				id: "/api/planning/team/[snapshotId]",
				pattern: /^\/api\/planning\/team\/([^/]+?)\/?$/,
				params: [{"name":"snapshotId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Bwoy7puH.js'))
			},
			{
				id: "/api/planning/wbs",
				pattern: /^\/api\/planning\/wbs\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BlQvMzph.js'))
			},
			{
				id: "/api/planning/wbs/export",
				pattern: /^\/api\/planning\/wbs\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CY5DMXcL.js'))
			},
			{
				id: "/api/planning/wbs/items",
				pattern: /^\/api\/planning\/wbs\/items\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-fSkflPCd.js'))
			},
			{
				id: "/api/planning/wbs/items/[itemId]",
				pattern: /^\/api\/planning\/wbs\/items\/([^/]+?)\/?$/,
				params: [{"name":"itemId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DpqtK-hW.js'))
			},
			{
				id: "/api/planning/wbs/[snapshotId]",
				pattern: /^\/api\/planning\/wbs\/([^/]+?)\/?$/,
				params: [{"name":"snapshotId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DnTC81-G.js'))
			},
			{
				id: "/assessments",
				pattern: /^\/assessments\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/assessments/[id]",
				pattern: /^\/assessments\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/analysis",
				pattern: /^\/assessments\/([^/]+?)\/analysis\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/analysis/review",
				pattern: /^\/assessments\/([^/]+?)\/analysis\/review\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/dashboard",
				pattern: /^\/assessments\/([^/]+?)\/dashboard\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/discovery",
				pattern: /^\/assessments\/([^/]+?)\/discovery\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/discovery/review",
				pattern: /^\/assessments\/([^/]+?)\/discovery\/review\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/estimate",
				pattern: /^\/assessments\/([^/]+?)\/estimate\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/estimate/review",
				pattern: /^\/assessments\/([^/]+?)\/estimate\/review\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/gaps",
				pattern: /^\/assessments\/([^/]+?)\/gaps\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/refine",
				pattern: /^\/assessments\/([^/]+?)\/refine\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/assessments/[id]/refine/review",
				pattern: /^\/assessments\/([^/]+?)\/refine\/review\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/clients",
				pattern: /^\/clients\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/clients/[id]",
				pattern: /^\/clients\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/knowledge",
				pattern: /^\/knowledge\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/knowledge/[id]",
				pattern: /^\/knowledge\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/new",
				pattern: /^\/new\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/planning",
				pattern: /^\/planning\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 29 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map

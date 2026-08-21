/**
 * Stored results from a real pipeline run, shipped so the site is useful
 * without a reachable API. Every number here came out of this project's own
 * code; nothing is synthetic. The frames are the four-heading sample sweep the
 * urban_canopy repository publishes under `samples/images/`.
 *
 * Both payloads have exactly the shape the web API returns -- including the
 * per-view `overlays` that `/analyse/multi` sends when `return_overlays` is on
 * -- so they travel through the same renderer as a live response.
 */

export const DEMO_SINGLE = {
  "backend": "oneformer",
  "class_space": "ade20k",
  "capture": {
    "source": "local",
    "lat": null,
    "lon": null,
    "heading": 0,
    "pitch": null,
    "fov": null,
    "size": null,
    "address": null,
    "pano_id": null,
    "capture_date": null,
    "image_path": "samples/images/streetview_id1_heading0.jpg"
  },
  "coverage": {
    "valid_pixels": 240000,
    "total_pixels": 240000,
    "tree_pixels": 76725,
    "tree_coverage_ratio": 0.3196875,
    "tree_coverage_pct": 31.96875,
    "tree_source": "tree_class",
    "vegetation_pixels": 102426,
    "vegetation_coverage_ratio": 0.426775,
    "vegetation_coverage_pct": 42.6775,
    "group_ratios": {
      "tree": 0.3196875,
      "grass": 0.1070875,
      "plant_shrub": 0.0
    }
  },
  "refinement": {
    "enabled": true,
    "area_raw": 76725,
    "area_refined": 76725,
    "components_removed": 0,
    "holes_filled": 0,
    "area_growth_frac": 0.0,
    "growth_guard_triggered": false,
    "config": {
      "enabled": true,
      "min_component_area_px": 64,
      "min_component_area_frac": null,
      "max_hole_area_px": 64,
      "open_kernel_px": 0,
      "close_kernel_px": 0,
      "max_area_growth_frac": 0.05
    }
  },
  "quality_flags": [],
  "backend_notes": [
    "shi-labs/oneformer_ade20k_swin_large predicts the ade20k class space (semantic task).",
    "ADE20K treats 'tree' as a stuff class, so this backend cannot individualise trees; coverage only."
  ],
  "overlays": {
    "rgb_url": "assets/img/demo-h000-rgb.jpg",
    "overlay_tree_url": "assets/img/demo-h000-overlay.jpg",
    "mask_refined_url": "assets/img/demo-h000-mask.png"
  }
};

export const DEMO_MULTI = {
  "location": {
    "lat": null,
    "lon": null,
    "address": null
  },
  "plan": {
    "mode": "offsets",
    "reference_heading": 0,
    "offsets": [
      0,
      90,
      180,
      270
    ],
    "n_views": 4,
    "headings": [],
    "pitch": 0,
    "fov": 90,
    "size": null,
    "min_successful_views": 1,
    "planned_headings": [
      0,
      90,
      180,
      270
    ]
  },
  "aggregate": {
    "tree_coverage": {
      "n_views": 4,
      "n_valid_views": 4,
      "mean": 0.166334375,
      "median": 0.16882708333333335,
      "p25": 0.10273020833333334,
      "p75": 0.23243125,
      "iqr": 0.12970104166666668,
      "std": 0.11289795183836099,
      "min": 0.007995833333333334,
      "max": 0.3196875
    },
    "tree_coverage_pct": {
      "mean": 16.6334375,
      "median": 16.882708333333333,
      "p25": 10.273020833333334,
      "p75": 23.243125,
      "iqr": 12.970104166666669,
      "std": 11.289795183836098,
      "min": 0.7995833333333334,
      "max": 31.96875
    },
    "vegetation_coverage": {
      "n_views": 4,
      "n_valid_views": 4,
      "mean": 0.2817375,
      "median": 0.29403124999999997,
      "p25": 0.23585625,
      "p75": 0.3399125,
      "iqr": 0.10405625000000002,
      "std": 0.11256536091280725,
      "min": 0.1121125,
      "max": 0.426775
    },
    "headings": [
      0,
      90,
      180,
      270
    ],
    "quality_flags": []
  },
  "views": [
    {
      "backend": "oneformer",
      "class_space": "ade20k",
      "capture": {
        "source": "local",
        "lat": null,
        "lon": null,
        "heading": 0,
        "pitch": null,
        "fov": null,
        "size": null,
        "address": null,
        "pano_id": null,
        "capture_date": null,
        "image_path": "samples/images/streetview_id1_heading0.jpg"
      },
      "coverage": {
        "valid_pixels": 240000,
        "total_pixels": 240000,
        "tree_pixels": 76725,
        "tree_coverage_ratio": 0.3196875,
        "tree_coverage_pct": 31.96875,
        "tree_source": "tree_class",
        "vegetation_pixels": 102426,
        "vegetation_coverage_ratio": 0.426775,
        "vegetation_coverage_pct": 42.6775,
        "group_ratios": {
          "tree": 0.3196875,
          "grass": 0.1070875,
          "plant_shrub": 0.0
        }
      },
      "refinement": {
        "enabled": true,
        "area_raw": 76725,
        "area_refined": 76725,
        "components_removed": 0,
        "holes_filled": 0,
        "area_growth_frac": 0.0,
        "growth_guard_triggered": false,
        "config": {
          "enabled": true,
          "min_component_area_px": 64,
          "min_component_area_frac": null,
          "max_hole_area_px": 64,
          "open_kernel_px": 0,
          "close_kernel_px": 0,
          "max_area_growth_frac": 0.05
        }
      },
      "quality_flags": [],
      "backend_notes": [
        "shi-labs/oneformer_ade20k_swin_large predicts the ade20k class space (semantic task).",
        "ADE20K treats 'tree' as a stuff class, so this backend cannot individualise trees; coverage only."
      ],
      "overlays": {
        "rgb_url": "assets/img/demo-h000-rgb.jpg",
        "overlay_tree_url": "assets/img/demo-h000-overlay.jpg",
        "mask_refined_url": "assets/img/demo-h000-mask.png"
      }
    },
    {
      "backend": "oneformer",
      "class_space": "ade20k",
      "capture": {
        "source": "local",
        "lat": null,
        "lon": null,
        "heading": 90,
        "pitch": null,
        "fov": null,
        "size": null,
        "address": null,
        "pano_id": null,
        "capture_date": null,
        "image_path": "samples/images/streetview_id1_heading90.jpg"
      },
      "coverage": {
        "valid_pixels": 240000,
        "total_pixels": 240000,
        "tree_pixels": 1919,
        "tree_coverage_ratio": 0.007995833333333334,
        "tree_coverage_pct": 0.7995833333333334,
        "tree_source": "tree_class",
        "vegetation_pixels": 26907,
        "vegetation_coverage_ratio": 0.1121125,
        "vegetation_coverage_pct": 11.21125,
        "group_ratios": {
          "tree": 0.008,
          "grass": 0.08001666666666667,
          "plant_shrub": 0.024095833333333334
        }
      },
      "refinement": {
        "enabled": true,
        "area_raw": 1920,
        "area_refined": 1919,
        "components_removed": 1,
        "holes_filled": 0,
        "area_growth_frac": -0.0005208333333333333,
        "growth_guard_triggered": false,
        "config": {
          "enabled": true,
          "min_component_area_px": 64,
          "min_component_area_frac": null,
          "max_hole_area_px": 64,
          "open_kernel_px": 0,
          "close_kernel_px": 0,
          "max_area_growth_frac": 0.05
        }
      },
      "quality_flags": [],
      "backend_notes": [
        "shi-labs/oneformer_ade20k_swin_large predicts the ade20k class space (semantic task).",
        "ADE20K treats 'tree' as a stuff class, so this backend cannot individualise trees; coverage only."
      ],
      "overlays": {
        "rgb_url": "assets/img/demo-h090-rgb.jpg",
        "overlay_tree_url": "assets/img/demo-h090-overlay.jpg",
        "mask_refined_url": "assets/img/demo-h090-mask.png"
      }
    },
    {
      "backend": "oneformer",
      "class_space": "ade20k",
      "capture": {
        "source": "local",
        "lat": null,
        "lon": null,
        "heading": 180,
        "pitch": null,
        "fov": null,
        "size": null,
        "address": null,
        "pano_id": null,
        "capture_date": null,
        "image_path": "samples/images/streetview_id1_heading180.jpg"
      },
      "coverage": {
        "valid_pixels": 240000,
        "total_pixels": 240000,
        "tree_pixels": 32234,
        "tree_coverage_ratio": 0.13430833333333334,
        "tree_coverage_pct": 13.430833333333334,
        "tree_source": "tree_class",
        "vegetation_pixels": 74630,
        "vegetation_coverage_ratio": 0.31095833333333334,
        "vegetation_coverage_pct": 31.095833333333335,
        "group_ratios": {
          "tree": 0.1343625,
          "grass": 0.17659583333333334,
          "plant_shrub": 0.0
        }
      },
      "refinement": {
        "enabled": true,
        "area_raw": 32247,
        "area_refined": 32234,
        "components_removed": 1,
        "holes_filled": 0,
        "area_growth_frac": -0.0004031382764288151,
        "growth_guard_triggered": false,
        "config": {
          "enabled": true,
          "min_component_area_px": 64,
          "min_component_area_frac": null,
          "max_hole_area_px": 64,
          "open_kernel_px": 0,
          "close_kernel_px": 0,
          "max_area_growth_frac": 0.05
        }
      },
      "quality_flags": [],
      "backend_notes": [
        "shi-labs/oneformer_ade20k_swin_large predicts the ade20k class space (semantic task).",
        "ADE20K treats 'tree' as a stuff class, so this backend cannot individualise trees; coverage only."
      ],
      "overlays": {
        "rgb_url": "assets/img/demo-h180-rgb.jpg",
        "overlay_tree_url": "assets/img/demo-h180-overlay.jpg",
        "mask_refined_url": "assets/img/demo-h180-mask.png"
      }
    },
    {
      "backend": "oneformer",
      "class_space": "ade20k",
      "capture": {
        "source": "local",
        "lat": null,
        "lon": null,
        "heading": 270,
        "pitch": null,
        "fov": null,
        "size": null,
        "address": null,
        "pano_id": null,
        "capture_date": null,
        "image_path": "samples/images/streetview_id1_heading270.jpg"
      },
      "coverage": {
        "valid_pixels": 240000,
        "total_pixels": 240000,
        "tree_pixels": 48803,
        "tree_coverage_ratio": 0.20334583333333334,
        "tree_coverage_pct": 20.334583333333335,
        "tree_source": "tree_class",
        "vegetation_pixels": 66505,
        "vegetation_coverage_ratio": 0.27710416666666665,
        "vegetation_coverage_pct": 27.710416666666664,
        "group_ratios": {
          "tree": 0.20334583333333334,
          "grass": 0.07375833333333333,
          "plant_shrub": 0.0
        }
      },
      "refinement": {
        "enabled": true,
        "area_raw": 48803,
        "area_refined": 48803,
        "components_removed": 0,
        "holes_filled": 0,
        "area_growth_frac": 0.0,
        "growth_guard_triggered": false,
        "config": {
          "enabled": true,
          "min_component_area_px": 64,
          "min_component_area_frac": null,
          "max_hole_area_px": 64,
          "open_kernel_px": 0,
          "close_kernel_px": 0,
          "max_area_growth_frac": 0.05
        }
      },
      "quality_flags": [],
      "backend_notes": [
        "shi-labs/oneformer_ade20k_swin_large predicts the ade20k class space (semantic task).",
        "ADE20K treats 'tree' as a stuff class, so this backend cannot individualise trees; coverage only."
      ],
      "overlays": {
        "rgb_url": "assets/img/demo-h270-rgb.jpg",
        "overlay_tree_url": "assets/img/demo-h270-overlay.jpg",
        "mask_refined_url": "assets/img/demo-h270-mask.png"
      }
    }
  ],
  "failures": [],
  "backend_provenance": {
    "backend": "oneformer",
    "checkpoint": "shi-labs/oneformer_ade20k_swin_large",
    "model_name": "shi-labs/oneformer_ade20k_swin_large",
    "checkpoint_sha256": null,
    "class_space": "ade20k",
    "taxonomy": {
      "class_space": "ade20k",
      "groups": [
        {
          "name": "tree",
          "aliases": [
            "tree",
            "palm",
            "palm tree"
          ]
        },
        {
          "name": "grass",
          "aliases": [
            "grass"
          ]
        },
        {
          "name": "plant_shrub",
          "aliases": [
            "plant",
            "flora",
            "plant life",
            "flower",
            "bush",
            "shrub"
          ]
        }
      ],
      "tree_group": "tree",
      "vegetation_groups": [
        "tree",
        "grass",
        "plant_shrub"
      ],
      "tree_proxy_group": null,
      "alias_priority": {}
    },
    "taxonomy_source": "built-in",
    "device": "cuda"
  }
};

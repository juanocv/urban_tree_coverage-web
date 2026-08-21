/**
 * Stored results from two real pipeline runs, shipped so the site is useful
 * without a reachable API. Every number here came out of `tree-ai`; nothing is
 * synthetic. The imagery is the curated sample frame the urban_canopy
 * repository already publishes under `samples/images/`.
 *
 * Both payloads have exactly the shape the web API returns, so they travel
 * through the same renderer as a live response.
 */

export const DEMO_SINGLE = {
  "backend": "oneformer",
  "class_space": "ade20k",
  "capture": {
    "source": "local",
    "lat": null,
    "lon": null,
    "heading": null,
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
  },
  "overlays": {
    "rgb_url": "assets/img/demo-rgb.jpg",
    "overlay_tree_url": "assets/img/demo-overlay.jpg",
    "mask_refined_url": "assets/img/demo-mask.png"
  }
};

export const DEMO_MULTI = {
  "location": {
    "lat": -23.6434,
    "lon": -46.528,
    "address": "R. Abolição — Vila São Pedro, São Paulo"
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
    "size": "640x640",
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
      "mean": 0.2975238037109375,
      "median": 0.28293701171875,
      "p25": 0.25644592285156254,
      "p75": 0.324014892578125,
      "iqr": 0.06756896972656246,
      "std": 0.06307629116169325,
      "min": 0.2269384765625,
      "max": 0.39728271484375
    },
    "tree_coverage_pct": {
      "mean": 29.75238037109375,
      "median": 28.293701171875004,
      "p25": 25.644592285156254,
      "p75": 32.4014892578125,
      "iqr": 6.756896972656246,
      "std": 6.307629116169325,
      "min": 22.69384765625,
      "max": 39.728271484375
    },
    "vegetation_coverage": {
      "n_views": 4,
      "n_valid_views": 4,
      "mean": 0.2974444580078125,
      "median": 0.282939453125,
      "p25": 0.2564617919921875,
      "p75": 0.32392211914062496,
      "iqr": 0.06746032714843747,
      "std": 0.06304942449392413,
      "min": 0.22677490234375,
      "max": 0.3971240234375
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
        "source": "streetview",
        "lat": -23.6433988,
        "lon": -46.527992,
        "heading": 0,
        "pitch": 0,
        "fov": 90,
        "size": "640x640",
        "address": "R. Abolição, 143 - Vila Sao Pedro",
        "pano_id": "yF_-fCd7Lh8KIfGNEwTpxg",
        "capture_date": "2025-08",
        "image_path": "C:\\Users\\Juan Oliveira\\.urban_canopy\\cache\\streetview\\sv_-23.643399_-46.527992_000_00_90_640x640.jpg"
      },
      "coverage": {
        "valid_pixels": 409600,
        "total_pixels": 409600,
        "tree_pixels": 92954,
        "tree_coverage_ratio": 0.2269384765625,
        "tree_coverage_pct": 22.69384765625,
        "tree_source": "tree_class",
        "vegetation_pixels": 92887,
        "vegetation_coverage_ratio": 0.22677490234375,
        "vegetation_coverage_pct": 22.677490234375,
        "group_ratios": {
          "tree": 0.22677490234375,
          "grass": 0.0,
          "plant_shrub": 0.0
        }
      },
      "refinement": {
        "enabled": true,
        "area_raw": 92887,
        "area_refined": 92954,
        "components_removed": 0,
        "holes_filled": 2,
        "area_growth_frac": 0.0007213065337453034,
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
      ]
    },
    {
      "backend": "oneformer",
      "class_space": "ade20k",
      "capture": {
        "source": "streetview",
        "lat": -23.6433988,
        "lon": -46.527992,
        "heading": 90,
        "pitch": 0,
        "fov": 90,
        "size": "640x640",
        "address": "R. Abolição, 143 - Vila Sao Pedro",
        "pano_id": "yF_-fCd7Lh8KIfGNEwTpxg",
        "capture_date": "2025-08",
        "image_path": "C:\\Users\\Juan Oliveira\\.urban_canopy\\cache\\streetview\\sv_-23.643399_-46.527992_090_00_90_640x640.jpg"
      },
      "coverage": {
        "valid_pixels": 409600,
        "total_pixels": 409600,
        "tree_pixels": 162727,
        "tree_coverage_ratio": 0.39728271484375,
        "tree_coverage_pct": 39.728271484375,
        "tree_source": "tree_class",
        "vegetation_pixels": 162662,
        "vegetation_coverage_ratio": 0.3971240234375,
        "vegetation_coverage_pct": 39.71240234375,
        "group_ratios": {
          "tree": 0.3970947265625,
          "grass": 0.0,
          "plant_shrub": 2.9296875e-05
        }
      },
      "refinement": {
        "enabled": true,
        "area_raw": 162650,
        "area_refined": 162727,
        "components_removed": 1,
        "holes_filled": 5,
        "area_growth_frac": 0.00047340916077466956,
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
      ]
    },
    {
      "backend": "oneformer",
      "class_space": "ade20k",
      "capture": {
        "source": "streetview",
        "lat": -23.6433988,
        "lon": -46.527992,
        "heading": 180,
        "pitch": 0,
        "fov": 90,
        "size": "640x640",
        "address": "R. Abolição, 143 - Vila Sao Pedro",
        "pano_id": "yF_-fCd7Lh8KIfGNEwTpxg",
        "capture_date": "2025-08",
        "image_path": "C:\\Users\\Juan Oliveira\\.urban_canopy\\cache\\streetview\\sv_-23.643399_-46.527992_180_00_90_640x640.jpg"
      },
      "coverage": {
        "valid_pixels": 409600,
        "total_pixels": 409600,
        "tree_pixels": 109069,
        "tree_coverage_ratio": 0.26628173828125,
        "tree_coverage_pct": 26.628173828125,
        "tree_source": "tree_class",
        "vegetation_pixels": 109100,
        "vegetation_coverage_ratio": 0.266357421875,
        "vegetation_coverage_pct": 26.6357421875,
        "group_ratios": {
          "tree": 0.266357421875,
          "grass": 0.0,
          "plant_shrub": 0.0
        }
      },
      "refinement": {
        "enabled": true,
        "area_raw": 109100,
        "area_refined": 109069,
        "components_removed": 2,
        "holes_filled": 1,
        "area_growth_frac": -0.0002841429880843263,
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
      ]
    },
    {
      "backend": "oneformer",
      "class_space": "ade20k",
      "capture": {
        "source": "streetview",
        "lat": -23.6433988,
        "lon": -46.527992,
        "heading": 270,
        "pitch": 0,
        "fov": 90,
        "size": "640x640",
        "address": "R. Abolição, 143 - Vila Sao Pedro",
        "pano_id": "yF_-fCd7Lh8KIfGNEwTpxg",
        "capture_date": "2025-08",
        "image_path": "C:\\Users\\Juan Oliveira\\.urban_canopy\\cache\\streetview\\sv_-23.643399_-46.527992_270_00_90_640x640.jpg"
      },
      "coverage": {
        "valid_pixels": 409600,
        "total_pixels": 409600,
        "tree_pixels": 122713,
        "tree_coverage_ratio": 0.29959228515625,
        "tree_coverage_pct": 29.959228515625004,
        "tree_source": "tree_class",
        "vegetation_pixels": 122684,
        "vegetation_coverage_ratio": 0.299521484375,
        "vegetation_coverage_pct": 29.952148437499996,
        "group_ratios": {
          "tree": 0.299521484375,
          "grass": 0.0,
          "plant_shrub": 0.0
        }
      },
      "refinement": {
        "enabled": true,
        "area_raw": 122684,
        "area_refined": 122713,
        "components_removed": 1,
        "holes_filled": 1,
        "area_growth_frac": 0.00023637964200710768,
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
      ]
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

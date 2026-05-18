## <small>[0.1.4](https://github.com/rolldown/plugins/compare/plugin-emotion@0.1.3...plugin-emotion@0.1.4) (2026-05-18)</small>
### Bug Fixes

* **deps:** update rolldown-related dependencies ([#78](https://github.com/rolldown/plugins/issues/78)) ([6a57129](https://github.com/rolldown/plugins/commit/6a57129a927c1fd548d03644114801c0f1e2c424))
* **emotion:** build `oxc-unshadowed-visitor` before publish ([#84](https://github.com/rolldown/plugins/issues/84)) ([e11de0b](https://github.com/rolldown/plugins/commit/e11de0bfa4bbd86886141373ad2525b8bc776486)), closes [#83](https://github.com/rolldown/plugins/issues/83)

### Reverts

* "chore: bump root pnpm to 11.1.2" ([#80](https://github.com/rolldown/plugins/issues/80)) ([0a63e15](https://github.com/rolldown/plugins/commit/0a63e1565c03da8e1ad0e7b1d19556552dc61d61))

### Miscellaneous Chores

* bump root pnpm to 11.1.2 ([#76](https://github.com/rolldown/plugins/issues/76)) ([e3cf1ad](https://github.com/rolldown/plugins/commit/e3cf1adc4126fbd4e393e7cb3010367adf707a8d)), closes [pnpm/pnpm#11663](https://github.com/pnpm/pnpm/issues/11663) [pnpm/pnpm#11662](https://github.com/pnpm/pnpm/issues/11662)
* **deps:** update all non-major dependencies ([#77](https://github.com/rolldown/plugins/issues/77)) ([0b70858](https://github.com/rolldown/plugins/commit/0b70858300ac4b7227611303f036b3684256fb31))
* remove irrelevant commits from changelog ([#70](https://github.com/rolldown/plugins/issues/70)) ([fa0800c](https://github.com/rolldown/plugins/commit/fa0800cd569887409275bc524bd7f6781700c279))
* use pnpm catalog for some packages ([#82](https://github.com/rolldown/plugins/issues/82)) ([d717e25](https://github.com/rolldown/plugins/commit/d717e2507bce0250702674a138801141d453e4d6))

### Tests

* benchmark smoke test ([#81](https://github.com/rolldown/plugins/issues/81)) ([c235c00](https://github.com/rolldown/plugins/commit/c235c00714de52a02570d3cfb0cffff4dd3eb5c2))

## <small>[0.1.3](https://github.com/rolldown/plugins/compare/plugin-emotion@0.1.2...plugin-emotion@0.1.3) (2026-05-11)</small>
### Features

* **oxc-unshadowed-visitor:** allow `oxc-parser` as peer deps ([#43](https://github.com/rolldown/plugins/issues/43)) ([5b018d1](https://github.com/rolldown/plugins/commit/5b018d1c157dfbe7ffef5b16d0eee0f137c28964))

### Bug Fixes

* **deps:** update all non-major dependencies ([#35](https://github.com/rolldown/plugins/issues/35)) ([f359c39](https://github.com/rolldown/plugins/commit/f359c3923b3802e4efa68da6c9e85aec1fda96d3))
* **deps:** update all non-major dependencies ([#49](https://github.com/rolldown/plugins/issues/49)) ([8047e05](https://github.com/rolldown/plugins/commit/8047e05a978ba7e0544111d8c2deb7ca335af076))
* **deps:** update all non-major dependencies ([#54](https://github.com/rolldown/plugins/issues/54)) ([a2a320f](https://github.com/rolldown/plugins/commit/a2a320fea4b388401ff5257bc8002c7fa8ec66d4))
* **deps:** update all non-major dependencies ([#58](https://github.com/rolldown/plugins/issues/58)) ([d170cf3](https://github.com/rolldown/plugins/commit/d170cf3809b4c961c91f99b047abb9acbfa40ce3))
* **deps:** update all non-major dependencies ([#65](https://github.com/rolldown/plugins/issues/65)) ([465fb38](https://github.com/rolldown/plugins/commit/465fb3860ef37ac916e67c76c518c24298a7712d))
* **deps:** update rolldown-related dependencies ([#36](https://github.com/rolldown/plugins/issues/36)) ([b2bf24b](https://github.com/rolldown/plugins/commit/b2bf24bd65d23bd051aa2f7b3cdee22ca1d58e2f))
* **deps:** update rolldown-related dependencies ([#46](https://github.com/rolldown/plugins/issues/46)) ([6b7fcfc](https://github.com/rolldown/plugins/commit/6b7fcfcc8f0107c0c698ead7d29a65d4ea7c46cd))
* **deps:** update rolldown-related dependencies ([#50](https://github.com/rolldown/plugins/issues/50)) ([232515f](https://github.com/rolldown/plugins/commit/232515f251da54c60e0e139d655677f62c3868e5))
* **deps:** update rolldown-related dependencies ([#55](https://github.com/rolldown/plugins/issues/55)) ([c432590](https://github.com/rolldown/plugins/commit/c43259004d90b7a0e5eb9b8ede94de3e651f25c1))
* **deps:** update rolldown-related dependencies ([#59](https://github.com/rolldown/plugins/issues/59)) ([e0e474c](https://github.com/rolldown/plugins/commit/e0e474c00f1fcc237b81c3c64ad71de488227db7))
* **deps:** update rolldown-related dependencies ([#66](https://github.com/rolldown/plugins/issues/66)) ([717a2a6](https://github.com/rolldown/plugins/commit/717a2a6ee1b3f43ae9a0f63bed0e3c031500d2ba))
* **emotion:** keyframe label should have `label:` ([#69](https://github.com/rolldown/plugins/issues/69)) ([c765fd6](https://github.com/rolldown/plugins/commit/c765fd604f60436aba27d4e276072bd00870e0d0))

### Miscellaneous Chores

* prepare for publishing oxc-unshadowed-visitor ([#42](https://github.com/rolldown/plugins/issues/42)) ([67d7f6a](https://github.com/rolldown/plugins/commit/67d7f6aeb9e152b08a47862390b67243d2d9ad7d))

## <small>[0.1.2](https://github.com/rolldown/plugins/compare/plugin-emotion@0.1.1...plugin-emotion@0.1.2) (2026-03-19)</small>
### Bug Fixes

* **emotion:** handle trailing comma in styled(Component,)(styles) ([#32](https://github.com/rolldown/plugins/issues/32)) ([f48813e](https://github.com/rolldown/plugins/commit/f48813ef184a934be1bdf2fca08cef8f0eee3d1a))
* **emotion:** use Buffer.from for base64 encoding in source maps ([#33](https://github.com/rolldown/plugins/issues/33)) ([6960796](https://github.com/rolldown/plugins/commit/6960796e44c29acebec7045d23153ede978a2fab))

### Miscellaneous Chores

* **deps:** update all non-major dependencies ([#24](https://github.com/rolldown/plugins/issues/24)) ([ce4bf5a](https://github.com/rolldown/plugins/commit/ce4bf5a0452e36c6f654f60f854fb2c834494576))

## <small>[0.1.1](https://github.com/rolldown/plugins/compare/plugin-emotion@0.1.0...plugin-emotion@0.1.1) (2026-03-15)</small>
### Miscellaneous Chores

* **emotion:** add CHANGELOG.md ([8bf16ef](https://github.com/rolldown/plugins/commit/8bf16ef5905e539a4f437115f6db21759c5b8281))

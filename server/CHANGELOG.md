# CHANGELOG

<!-- version list -->

## v1.3.0 (2026-03-28)

### Bug Fixes

- **auth**: Set token getter synchronously to prevent 401 on reload for admin page
  ([`56c5bdc`](https://github.com/magkue/request/commit/56c5bdc37f68280e153a45a97eebbc880c73ec52))

### Chores

- Fix formatting
  ([`32084a2`](https://github.com/magkue/request/commit/32084a22b162e00f3946af7558f42b45f247468a))

- Fix tests
  ([`ce89929`](https://github.com/magkue/request/commit/ce8992928ca28798e81b013299a591cb120ae6bb))

- Update READMEs and AGENTS.md
  ([`739214e`](https://github.com/magkue/request/commit/739214e9bf9e844d721ce87dad38435906d14e3e))

- **helm**: Update chart for Redmine support and PostgreSQL 18
  ([`78616ea`](https://github.com/magkue/request/commit/78616ea1e11f0216c88df9d6818a151cf0c5c5f5))

- **release**: 1.4.0 [skip ci]
  ([`748bc64`](https://github.com/magkue/request/commit/748bc64a150e41df9d910261bcbc4bbe79593090))

### Features

- **retention**: Add automatic data retention with GDPR-compliant privacy updates
  ([`ce9561b`](https://github.com/magkue/request/commit/ce9561b144218db40678a23fb1edcf5af8a184b5))

- **ssh**: Preselect existing key option when user has stored keys
  ([`852f0d9`](https://github.com/magkue/request/commit/852f0d9c35db2ebca11d48bfd5641537a98e5704))


## v1.2.1 (2026-03-21)

### Bug Fixes

- Allow clearing image URL and description fields
  ([`9b76dc4`](https://github.com/magkue/request/commit/9b76dc494da4652c54553e051e84a6ec59078f10))

### Chores

- **release**: 1.3.1 [skip ci]
  ([`5fad10c`](https://github.com/magkue/request/commit/5fad10cc255bdcec0d5f066c057720bf22f6052b))


## v1.2.0 (2026-03-21)

### Bug Fixes

- Adapt for redmine usage
  ([`bb251d8`](https://github.com/magkue/request/commit/bb251d87232648fe965bcb0e76dd166417174afe))

- Revert responsive design
  ([`e02673c`](https://github.com/magkue/request/commit/e02673c797ade8eacf8a8093884940ff1a3ba1d0))

### Chores

- Highlight login badge
  ([`43c5b85`](https://github.com/magkue/request/commit/43c5b85e9caa4d98564bc2567ab2b9cf655e05ca))

- **release**: 1.1.0 [skip ci]
  ([`e1aec98`](https://github.com/magkue/request/commit/e1aec982de4a6bd86159741c1e66ef78a206b709))

- **release**: 1.2.0 [skip ci]
  ([`43fa522`](https://github.com/magkue/request/commit/43fa522a58db02de1d642e8edca3b98fb496d817))

- **release**: 1.3.0 [skip ci]
  ([`ec11e8a`](https://github.com/magkue/request/commit/ec11e8a41a544630863571b88800a1f76d5c8590))

### Features

- Add external links admin with drag-and-drop and e2e tests
  ([`f063884`](https://github.com/magkue/request/commit/f0638849c58e4b9bed274c0f92544b651944cc39))

- Add support requests
  ([`ce04253`](https://github.com/magkue/request/commit/ce0425387736457bd2ea90019244dfb63470e9fe))

- Improve responsiveness to different screen sizes
  ([`472e092`](https://github.com/magkue/request/commit/472e092eec7fe1a63a42e1765b3682cd1c38c1dd))

- Improve VM Request Form
  ([`854b342`](https://github.com/magkue/request/commit/854b3425f1b58dfb77ca087b9c6e8cf61614fac6))

### Testing

- **server**: Add test script for creating issues in tracking system
  ([`2a128a5`](https://github.com/magkue/request/commit/2a128a5693b64ee41060082b8ec41ed9aeeb3523))


## v1.1.0 (2026-03-18)

### Bug Fixes

- Update models and adjust anonymous artemis form
  ([`de7c054`](https://github.com/magkue/request/commit/de7c054ba39f0e85bbd936ec5586ba93d09ebb30))

### Continuous Integration

- Add e2e test workflow
  ([`bcfdece`](https://github.com/magkue/request/commit/bcfdeceffeb9259e493b153392600674255b1c0a))

- Fix docker images build, improve semantic release process
  ([`8b42216`](https://github.com/magkue/request/commit/8b422161b7fb7cb618eecbae2db893065b52acc3))

### Features

- Add redmine integration
  ([`df0b309`](https://github.com/magkue/request/commit/df0b3092ad62269686aabf19766711a58750e475))

### Refactoring

- **server**: Replace jira service with strategy pattern and reuse common templates
  ([`875e24e`](https://github.com/magkue/request/commit/875e24ea689cd895484a3c5bbb46469460cffc8f))

### Testing

- Add end-to-end test suite with Playwright
  ([`5b27062`](https://github.com/magkue/request/commit/5b27062f6fe7c070606b2455d1894a612d30a3c6))


## v1.0.0 (2026-03-12)

- Initial Release

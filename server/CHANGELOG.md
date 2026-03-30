# CHANGELOG

<!-- version list -->

## v1.5.1 (2026-03-30)

### Bug Fixes

- **annoucements**: Fix spelling mistake
  ([`0c93555`](https://github.com/magkue/request/commit/0c9355516b0602c300a7a2dcd3f3760c43b9e3fa))

### Chores

- **release**: 1.6.1 [skip ci]
  ([`7189165`](https://github.com/magkue/request/commit/7189165ffa3b4947c2260eb172c9f03dde15fd33))

### Continuous Integration

- **helm**: Add ingress-redirect
  ([`d3f9b7d`](https://github.com/magkue/request/commit/d3f9b7d2ee27c896786f3ecde43f0f9f22f8d0c3))


## v1.5.0 (2026-03-30)

### Chores

- **release**: 1.6.0 [skip ci]
  ([`2963afa`](https://github.com/magkue/request/commit/2963afab3b92a3c4b1070268a1b25c4a9c8f8a65))

### Continuous Integration

- **helm**: Always pull latest version of client and server
  ([`467f6df`](https://github.com/magkue/request/commit/467f6dfe2634f95dd5d6509d7eb315373eecb138))

### Features

- Add reusable what's new dialog and SSH key management
  ([`564151b`](https://github.com/magkue/request/commit/564151b5e04ca9dad5febe3493af5a05e7210de4))


## v1.4.0 (2026-03-28)

### Chores

- **release**: 1.5.0 [skip ci]
  ([`24c3a15`](https://github.com/magkue/request/commit/24c3a15d2e7e244b752b4e85b494a7c4156c5f87))

### Continuous Integration

- **e2e**: Fix e2e tests
  ([`9bfed6d`](https://github.com/magkue/request/commit/9bfed6da75b8b25e6b8335d18e8268f772ad45ba))

- **e2e**: Fix e2e tests
  ([`07b7455`](https://github.com/magkue/request/commit/07b7455c411d0ae72c5537a3ff2c97e0afdccbad))

### Features

- **ui**: Add environment badge to header for non-production deployments
  ([`d197bf2`](https://github.com/magkue/request/commit/d197bf2f85cbb0379da9905ebaab867314dd54ac))


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

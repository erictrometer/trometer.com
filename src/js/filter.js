document.addEventListener('alpine:init', () => {
  Alpine.data('projectFilter', () => ({
    selectedRole: '',
    selectedTags: [],
    _reducedMotion: typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    _animDurationMs: 420,
    _animEasing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    _leaveDurationMs: 150,
    _flipTimer: null,
    _tagCache: new WeakMap(),
    _getItems() {
      var grid = this.$refs?.grid;
      if (!grid) return [];
      return Array.from(grid.querySelectorAll('[data-project]'));
    },
    _snapshot() {
      var items = this._getItems();
      var map = new Map();
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var id = el.getAttribute('data-project');
        var visible = el.getClientRects().length > 0;
        map.set(id, { el: el, visible: visible, rect: visible ? el.getBoundingClientRect() : null });
      }
      return map;
    },
    _getParsedTags(el) {
      if (this._tagCache.has(el)) return this._tagCache.get(el);
      var tagsRaw = el.getAttribute('data-tags') || '[]';
      var tags = [];
      try {
        tags = JSON.parse(tagsRaw);
      } catch (e) {
        tags = [];
      }
      this._tagCache.set(el, tags);
      return tags;
    },
    _expectedVisibleCount() {
      var items = this._getItems();
      var count = 0;
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var role = el.getAttribute('data-role') || '';
        var tags = this._getParsedTags(el);
        var roleMatch = !this.selectedRole || role === this.selectedRole;
        var tagMatch = this.selectedTags.length === 0 || this.selectedTags.some(function(t) { return tags.includes(t); });
        if (roleMatch && tagMatch) count += 1;
      }
      return count;
    },
    _runFlip(first, last) {
      for (var [id, a] of first.entries()) {
        var b = last.get(id);
        if (!a || !b) continue;
        if (!a.visible || !b.visible) continue;
        if (!a.rect || !b.rect) continue;

        var dx = a.rect.left - b.rect.left;
        var dy = a.rect.top - b.rect.top;
        if (!dx && !dy) continue;

        a.el.animate(
          [
            { transform: 'translate(' + dx + 'px, ' + dy + 'px)' },
            { transform: 'translate(0px, 0px)' }
          ],
          { duration: this._animDurationMs, easing: this._animEasing }
        );
      }
    },
    _animateLayout(mutator) {
      if (this._reducedMotion) {
        mutator();
        return;
      }

      if (this._flipTimer) clearTimeout(this._flipTimer);
      this._flipTimer = null;

      var first = this._snapshot();
      mutator();

      this.$nextTick(() => {
        var mid = this._snapshot();
        this._runFlip(first, mid);

        var firstVisibleCount = Array.from(first.values()).filter(function(v) { return v.visible; }).length;
        var expectedVisibleCount = this._expectedVisibleCount();
        var isHiding = expectedVisibleCount < firstVisibleCount;

        if (isHiding) {
          this._flipTimer = setTimeout(() => {
            var last = this._snapshot();
            this._runFlip(mid, last);
            this._flipTimer = null;
          }, this._leaveDurationMs + 30);
        }
      });
    },
    setRole(role) {
      this._animateLayout(() => {
        this.selectedRole = role;
      });
    },
    toggleRole(role) {
      this._animateLayout(() => {
        this.selectedRole = this.selectedRole === role ? '' : role;
      });
    },
    toggleTag(tag) {
      this._animateLayout(() => {
        var i = this.selectedTags.indexOf(tag);
        if (i >= 0) this.selectedTags.splice(i, 1);
        else this.selectedTags.push(tag);
      });
    },
    isVisible(role, tags) {
      var roleMatch = !this.selectedRole || role === this.selectedRole;
      var tagMatch = this.selectedTags.length === 0 || this.selectedTags.some(function(t) { return tags.includes(t); });
      return roleMatch && tagMatch;
    }
  }));
});

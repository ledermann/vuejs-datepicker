<template>
  <div :class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showYearView" :style="calendarStyle" @mousedown.prevent>
    <slot name="beforeCalendarHeader"></slot>
    <header>
      <span
        @click="isRtl ? nextDecade() : previousDecade()"
        class="prev"
        :class="{'disabled': isLeftNavDisabled}">&lt;</span>
      <span>{{ getPageDecade }}</span>
      <span
        @click="isRtl ? previousDecade() : nextDecade()"
        class="next"
        :class="{'disabled': isRightNavDisabled}">&gt;</span>
    </header>
    <span
      class="cell year"
      v-for="year in years"
      :key="year.timestamp"
      :class="{ 'selected': year.isSelected, 'disabled': year.isDisabled }"
      @click.stop="selectYear(year)">{{ year.year }}</span>
  </div>
</template>
<script>
import { makeDateUtils } from '../utils/DateUtils'
export default {
  props: {
    showYearView: Boolean,
    selectedDate: Date,
    pageDate: Date,
    pageTimestamp: Number,
    disabledDates: Object,
    rollingDecades: Boolean,
    highlighted: Object,
    calendarClass: [String, Object, Array],
    calendarStyle: Object,
    translation: Object,
    isRtl: Boolean,
    allowedToShowView: Function,
    useUtc: Boolean
  },
  computed: {
    years () {
      const d = this.pageDate
      const year = this.beginOfDecade(d)
      let years = []
      // set up a new date object to the beginning of the current 'page'7
      let dObj = this.useUtc
        ? new Date(Date.UTC(year, d.getUTCMonth(), d.getUTCDate()))
        : new Date(year, d.getMonth(), d.getDate(), d.getHours(), d.getMinutes())
      for (let i = 0; i < 10; i++) {
        years.push({
          year: this.utils.getFullYear(dObj),
          timestamp: dObj.getTime(),
          isSelected: this.isSelectedYear(dObj),
          isDisabled: this.isDisabledYear(dObj)
        })
        this.utils.setFullYear(dObj, this.utils.getFullYear(dObj) + 1)
      }
      return years
    },
    /**
     * @return {String}
     */
    getPageDecade () {
      const decadeStart = this.beginOfDecade(this.pageDate)
      const decadeEnd = decadeStart + 9
      const yearSuffix = this.translation.yearSuffix
      return `${decadeStart} - ${decadeEnd}${yearSuffix}`
    },
    /**
     * Is the left hand navigation button disabled?
     * @return {Boolean}
     */
    isLeftNavDisabled () {
      return this.isRtl
        ? this.isNextDecadeDisabled(this.pageTimestamp)
        : this.isPreviousDecadeDisabled(this.pageTimestamp)
    },
    /**
     * Is the right hand navigation button disabled?
     * @return {Boolean}
     */
    isRightNavDisabled () {
      return this.isRtl
        ? this.isPreviousDecadeDisabled(this.pageTimestamp)
        : this.isNextDecadeDisabled(this.pageTimestamp)
    }
  },
  data () {
    const constructedDateUtils = makeDateUtils(this.useUtc)
    return {
      utils: constructedDateUtils
    }
  },
  methods: {
    selectYear (year) {
      if (year.isDisabled) {
        return false
      }
      this.$emit('selectYear', year)
    },
    changeYear (incrementBy) {
      let date = this.pageDate
      this.utils.setFullYear(date, this.utils.getFullYear(date) + incrementBy)
      this.$emit('changedDecade', date)
    },
    beginOfDecade (date) {
      const year = this.utils.getFullYear(date)
      const realDecadeBegin = Math.floor(year / 10) * 10

      if (this.rollingDecades && this.disabledDates && this.disabledDates.from) {
        const maxYear = this.utils.getFullYear(this.disabledDates.from)
        const maxRealDecadeBegin = Math.floor(maxYear / 10) * 10
        const offset = 9 - (maxYear - maxRealDecadeBegin)
        const rollingDecadeBegin = realDecadeBegin - offset

        if (rollingDecadeBegin <= year - 10) {
          return rollingDecadeBegin + 10
        } else {
          return rollingDecadeBegin
        }
      } else {
        return realDecadeBegin
      }
    },
    previousDecade () {
      if (this.isPreviousDecadeDisabled()) {
        return false
      }
      this.changeYear(-10)
    },
    isPreviousDecadeDisabled () {
      if (!this.disabledDates || !this.disabledDates.to) {
        return false
      }
      const disabledYear = this.utils.getFullYear(this.disabledDates.to)
      const lastYearInPreviousPage = this.beginOfDecade(this.pageDate) - 1
      return disabledYear > lastYearInPreviousPage
    },
    nextDecade () {
      if (this.isNextDecadeDisabled()) {
        return false
      }
      this.changeYear(10)
    },
    isNextDecadeDisabled () {
      if (!this.disabledDates || !this.disabledDates.from) {
        return false
      }
      const disabledYear = this.utils.getFullYear(this.disabledDates.from)
      const firstYearInNextPage = this.beginOfDecade(this.pageDate) + 10
      return disabledYear < firstYearInNextPage
    },

    /**
     * Whether the selected date is in this year
     * @param {Date}
     * @return {Boolean}
     */
    isSelectedYear (date) {
      return this.selectedDate && this.utils.getFullYear(this.selectedDate) === this.utils.getFullYear(date)
    },
    /**
     * Whether a year is disabled
     * @param {Date}
     * @return {Boolean}
     */
    isDisabledYear (date) {
      let disabledDates = false
      if (typeof this.disabledDates === 'undefined' || !this.disabledDates) {
        return false
      }

      if (typeof this.disabledDates.to !== 'undefined' && this.disabledDates.to) {
        if (this.utils.getFullYear(date) < this.utils.getFullYear(this.disabledDates.to)) {
          disabledDates = true
        }
      }
      if (typeof this.disabledDates.from !== 'undefined' && this.disabledDates.from) {
        if (this.utils.getFullYear(date) > this.utils.getFullYear(this.disabledDates.from)) {
          disabledDates = true
        }
      }

      if (typeof this.disabledDates.customPredictor === 'function' && this.disabledDates.customPredictor(date)) {
        disabledDates = true
      }

      return disabledDates
    }
  }
}
// eslint-disable-next-line
;
</script>

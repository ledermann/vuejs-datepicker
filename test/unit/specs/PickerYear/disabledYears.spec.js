import PickerYear from '@/components/PickerYear.vue'
import {shallowMount} from '@vue/test-utils'
import {en} from '@/locale'

describe('PickerYear', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(PickerYear, {
      propsData: {
        allowedToShowView: () => true,
        translation: en,
        pageDate: new Date(2018, 3, 1),
        selectedDate: new Date(2018, 3, 19),
        disabledDates: {
          to: new Date(2018, 2, 14),
          from: new Date(2018, 4, 15)
        }
      }
    })
  })

  it('cant select a disabled year', () => {
    const year = {isDisabled: true}
    expect(wrapper.vm.selectYear(year)).toEqual(false)
  })

  it('cant navigate to a disabled year', () => {
    expect(wrapper.vm.previousDecade()).toEqual(false)
    expect(wrapper.vm.nextDecade()).toEqual(false)
  })

  it('can\'t change decade when previous or next decades are disabled', () => {
    wrapper.setProps({
      pageDate: new Date(2016, 9, 15),
      disabledDates: {
        to: new Date(2010, 8, 6),
        from: new Date(2017, 10, 24)
      }
    })
    expect(wrapper.vm.isPreviousDecadeDisabled()).toEqual(true)
    expect(wrapper.vm.isNextDecadeDisabled()).toEqual(true)
  })

  it('can change decade despite having a disabled decade', () => {
    wrapper.setProps({
      pageDate: new Date(2016, 9, 15),
      disabledDates: {
        to: new Date(2010, 11, 19),
        from: new Date(2021, 11, 19)
      }
    })
    expect(wrapper.vm.isPreviousDecadeDisabled()).toEqual(true)
    expect(wrapper.vm.isNextDecadeDisabled()).toEqual(false)
  })

  it('can accept a customPredictor to check if the year is disabled', () => {
    wrapper.setProps({
      disabledDates: {
        customPredictor (date) {
          if (date.getFullYear() % 3 === 0) {
            return true
          }
        }
      }
    })
    expect(wrapper.vm.isDisabledYear(new Date(2018, 4, 29))).toEqual(false)
    expect(wrapper.vm.isDisabledYear(new Date(2019, 9, 28))).toEqual(true)
    expect(wrapper.vm.isDisabledYear(new Date(2020, 8, 24))).toEqual(false)
    expect(wrapper.vm.isDisabledYear(new Date(2021, 2, 11))).toEqual(false)
    expect(wrapper.vm.isDisabledYear(new Date(2022, 2, 11))).toEqual(true)
  })

  it('does not disable the next decade button when disabled from date is in the first year of the next decade', () => {
    wrapper.setProps({
      pageDate: new Date(1998, 9, 15),
      disabledDates: {
        from: new Date(2000, 0, 1)
      }
    })
    expect(wrapper.vm.isNextDecadeDisabled()).toEqual(false)
  })

  it('does disable the next decade button when disabled from date is the last day year of the current decade', () => {
    wrapper.setProps({
      disabledDates: {
        from: new Date(1999, 12, 31)
      }
    })
    expect(wrapper.vm.isNextDecadeDisabled()).toEqual(true)
  })
})

describe('PickerYear with rollingDecades', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(PickerYear, {
      propsData: {
        allowedToShowView: () => true,
        translation: en,
        pageDate: new Date(2019, 3, 9),
        selectedDate: new Date(2000, 0, 1),
        rollingDecades: true,
        disabledDates: {
          to: new Date(1919, 0, 1),
          from: new Date(2003, 0, 1)
        }
      }
    })
  })

  it('calcs beginOfDecade', () => {
    expect(wrapper.vm.beginOfDecade(new Date(2003, 0, 1))).toEqual(1994)
    expect(wrapper.vm.beginOfDecade(new Date(2002, 0, 1))).toEqual(1994)
    expect(wrapper.vm.beginOfDecade(new Date(2001, 0, 1))).toEqual(1994)
    expect(wrapper.vm.beginOfDecade(new Date(2000, 0, 1))).toEqual(1994)
    expect(wrapper.vm.beginOfDecade(new Date(1999, 5, 1))).toEqual(1994)
    expect(wrapper.vm.beginOfDecade(new Date(1998, 5, 1))).toEqual(1994)
    expect(wrapper.vm.beginOfDecade(new Date(1997, 5, 1))).toEqual(1994)
    expect(wrapper.vm.beginOfDecade(new Date(1996, 5, 1))).toEqual(1994)
    expect(wrapper.vm.beginOfDecade(new Date(1995, 5, 1))).toEqual(1994)
    expect(wrapper.vm.beginOfDecade(new Date(1994, 5, 1))).toEqual(1994)

    expect(wrapper.vm.beginOfDecade(new Date(1993, 11, 31))).toEqual(1984)
  })
})

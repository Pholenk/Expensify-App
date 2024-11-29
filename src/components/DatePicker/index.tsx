import {setYear} from 'date-fns';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import CalendarPicker from './CalendarPicker';

type DatePickerProps = {
    /**
     * The datepicker supports any value that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    value?: string;

    /**
     * The datepicker supports any defaultValue that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    defaultValue?: string;

    inputID: string;

    /** A minimum date of calendar to select */
    minDate?: Date;

    /** A maximum date of calendar to select */
    maxDate?: Date;

    /** A function that is passed by FormWrapper */
    onInputChange?: (value: string) => void;

    /** A function that is passed by FormWrapper */
    onTouched?: () => void;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** ID of the wrapping form */
    formID?: keyof OnyxFormValuesMapping;
} & BaseTextInputProps;

function DatePicker(
    {
        containerStyles,
        defaultValue,
        disabled,
        errorText,
        inputID,
        label,
        maxDate = setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
        minDate = setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
        onInputChange,
        onTouched,
        placeholder,
        value,
        shouldSaveDraft = false,
        formID,
    }: DatePickerProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);
    const [isFocused, setIsFocused] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    });
    const [containerSize, setContainerSize] = useState({
        height: 50,
    });
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const popoverDisplayStyle = useMemo(() => {
        if (isFocused) {
            return styles.datePickerPopoverShow;
        }

        return styles.datePickerPopoverHide;
    }, [isFocused, styles.datePickerPopoverHide, styles.datePickerPopoverShow]);
    const inputValue = usePrevious(value);
    const localRef = useRef<HTMLInputElement | null>(null);

    const onSelected = (newValue: string) => {
        onTouched?.();
        onInputChange?.(newValue);
        setSelectedDate(newValue);
    };

    useEffect(() => {
        // Value is provided to input via props and onChange never fires. We have to save draft manually.
        if (shouldSaveDraft && !!formID) {
            FormActions.setDraftValues(formID, {[inputID]: selectedDate});
        }

        if (selectedDate === value || !value) {
            return;
        }

        setSelectedDate(value);
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        if (inputValue === value) {
            return;
        }

        localRef?.current?.focus();
        localRef?.current?.blur();
        setIsFocused(false);
    }, [inputValue, isFocused, value]);

    const onLayoutHandle = useCallback((event: LayoutChangeEvent) => {
        const {nativeEvent} = event;

        setPopoverPosition((prevState) => ({
            ...prevState,
            top: nativeEvent.layout.height,
        }));
        setContainerSize({
            height: nativeEvent.layout.height,
        });
    }, []);

    return (
        <View style={[styles.flex0, styles.datePickerRoot, containerSize]}>
            <View style={[shouldUseNarrowLayout ? styles.flex2 : {}]}>
                <TextInput
                    ref={(element: BaseTextInputRef | null): void => {
                        const baseTextInputRef = element;
                        if (typeof ref === 'function') {
                            ref(baseTextInputRef);
                        } else if (ref && 'current' in ref) {
                            // eslint-disable-next-line no-param-reassign
                            ref.current = baseTextInputRef;
                        }

                        localRef.current = element as HTMLInputElement | null;
                    }}
                    inputID={inputID}
                    forceActiveLabel
                    icon={Expensicons.Calendar}
                    label={label}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    value={selectedDate}
                    placeholder={placeholder ?? translate('common.dateFormat')}
                    errorText={errorText}
                    containerStyles={containerStyles}
                    textInputContainerStyles={[styles.borderColorFocus]}
                    inputStyle={[styles.pointerEventsNone]}
                    disabled={disabled}
                    readOnly={false}
                    disableKeyboard
                    onFocus={() => setIsFocused(true)}
                    onLayout={onLayoutHandle}
                />
            </View>
            <View
                style={[styles.datePickerPopover, styles.border, popoverDisplayStyle, popoverPosition]}
                collapsable={false}
            >
                <CalendarPicker
                    minDate={minDate}
                    maxDate={maxDate}
                    value={selectedDate}
                    onSelected={onSelected}
                />
            </View>
        </View>
    );
}

DatePicker.displayName = 'DatePicker';

export default forwardRef(DatePicker);

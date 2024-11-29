import React, {useMemo} from 'react';
import {View} from 'react-native';
import {AttachmentContext} from '@components/AttachmentContext';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import MultipleAvatars from '@components/MultipleAvatars';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import ReportActionItemDate from '@pages/home/report/ReportActionItemDate';
import ReportActionItemFragment from '@pages/home/report/ReportActionItemFragment';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import BaseListItem from './BaseListItem';
import type {ChatListItemProps, ListItem, ReportActionListItemType} from './types';

function ChatListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
}: ChatListItemProps<TItem>) {
    const reportActionItem = item as unknown as ReportActionListItemType;
    const from = reportActionItem.from;
    const icons = [
        {
            type: CONST.ICON_TYPE_AVATAR,
            source: from.avatar,
            name: reportActionItem.formattedFrom,
            id: from.accountID,
        },
    ];
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const attachmentContextValue = {type: CONST.ATTACHMENT_TYPE.SEARCH};

    const contextValue = {
        anchor: null,
        report: undefined,
        reportNameValuePairs: undefined,
        action: undefined,
        transactionThreadReport: undefined,
        checkIfContextMenuActive: () => {},
        isDisabled: true,
    };

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const hoveredBackgroundColor = styles.sidebarLinkHover?.backgroundColor ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    const mentionReportContextValue = useMemo(() => ({currentReportID: item?.reportID ?? '-1'}), [item.reportID]);

    const {reportData, reportActions, reportAction} = useMemo(() => {
        return {
            reportData: ReportUtils.getReport(item?.reportID ?? ''),
            reportActions: Object.values(ReportActionsUtils.getAllReportActions(item?.reportID ?? '')),
            reportAction: ReportActionsUtils.getReportAction(item?.reportID ?? '', item?.reportActionID ?? ''),
        };
    }, [item]);

    return (
        <BaseListItem
            item={item}
            pressableStyle={[[styles.selectionListPressableItemWrapper, styles.textAlignLeft, item.isSelected && styles.activeComponentBG, item.cursorStyle]]}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone]}
            containerStyle={styles.mb2}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onLongPressRow={onLongPressRow}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
        >
            <View style={styles.chatListWrapper}>
                <ReportActionItem
                    onPress={() => onSelectRow(item)}
                    report={reportData}
                    reportActions={reportActions}
                    parentReportAction={undefined}
                    action={reportAction as ReportAction}
                    displayAsGroup={false}
                    isMostRecentIOUReportAction={false}
                    shouldDisplayNewMarker={false}
                    index={0}
                    isFirstVisibleReportAction={false}
                />
            </View>
        </BaseListItem>
    );
}

ChatListItem.displayName = 'ChatListItem';

export default ChatListItem;

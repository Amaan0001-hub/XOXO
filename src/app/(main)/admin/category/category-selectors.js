import { createSelector } from 'reselect';

const categoryState = (state) => state.category;

export const categoryData = createSelector(
    [categoryState],
    (category) => category.data || []
);

export const categoryLoading = createSelector(
    [categoryState],
    (category) => category.loading
);

export const activeCategories = createSelector(
    [categoryState],
    (category) => category.activeCategories || []
);

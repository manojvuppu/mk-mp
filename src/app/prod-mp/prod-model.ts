export interface Product {
  categories: string[];
  name: string; // ProductImpl.marketing.displayName
  fullName: string; // ProductImpl.name
  shortName: string; // last part of ProductImpl.name
  image: string;
  rating: number;
  company: string;
  description: string;
  createdDate: Date;
  updatedDate: Date;
  $product?: any;
}

export function mapProduct(productImpl: any): Product {
  const image = _get(
    productImpl,
    "marketing.defaultImage.content",
    "images/our-solutions/aws-logo.svg"
  );
  const company = ""; //_getCustomField(productImpl, 'Seller', 'ABC');
  const rating = _getCustomField(productImpl, "Rating", "3");
  const fullName = _get(productImpl, "name");
  const shortName = fullName.split("/").pop();

  return {
    name: _get(productImpl, "marketing.displayName"),
    categories: productImpl.categories,
    fullName,
    shortName,
    image,
    company,
    rating: Math.floor(Number(rating)),
    description: _get(productImpl, "marketing.description"),
    createdDate: new Date(productImpl.createTime as any),
    updatedDate: new Date(productImpl.updateTime as any),
    $product: productImpl,
  };
}


export function _get(
  obj: any,
  path: string | string[],
  defaultValue?: any
): any {
  const paths = Array.isArray(path) ? path : path.split(".");
  const key = paths.splice(0, 1)[0];
  const value = obj.hasOwnProperty(key) ? obj[key] : undefined;
  return paths.length === 0
    ? value
    : value && paths[0]
    ? _get(value, paths)
    : defaultValue;
}

// tslint:disable-next-line:no-any
function _getCustomField(obj: any, field: string, defaultValue?: any): any {
  const customFields: CustomField = _get(obj, "definition.customFields");
  if (!!customFields && Array.isArray(customFields) && customFields.length) {
    const found = customFields.find((cstField) => cstField.name === field);
    if (found) {
      return found.content;
    }
  }

  return defaultValue;
}


export interface CustomField {
  /**
   * Name can be used to access the custom field.
   * This can be used as {ProductCustomField:FieldName}
   */
  name: string;

  /**
   * For strings, this is just any string data
   * For binary data, this is a GCS resource path
   */
  content: string;

  /**
   * For strings, this is empty
   * For binary data, this is the filename
   */
  filename: string;

  /**
   * Type of field
   */
  type: CustomFieldType;
}

export type CustomFieldType =
  'CUSTOM_FIELD_TYPE_UNSPECIFIED' |

  // User defined string
  'STRING' |

  // User uploaded private binary data
  'PRIVATE_BINARY';


  export interface ProductCategory {
    name: string;
    displayName: string;
    $category: any | null;
    parent: string;
    isParent: boolean;
    isSubCategory: boolean;
    children: ProductCategory[] | null;
  }

export interface UiCategory {
  category: ProductCategory;
  selected: boolean;
  uiSubCategories: UiSubCategory[];
}

export interface UiSubCategory {
  subCategory: string;
  displayName?: string,
  selected: boolean;
  uiCategory: UiCategory;
}

export function appendUiSubCategory(
  uiCategory: UiCategory,
  subCategory: string,
  displayName?: string
): UiSubCategory {
  let uiSubCategory = uiCategory.uiSubCategories.find(
    (uiSubCat) => uiSubCat.subCategory === subCategory
  );
  if (!uiSubCategory) {
    uiSubCategory = { uiCategory, subCategory, selected: false, displayName: displayName || subCategory };
    uiCategory.uiSubCategories.push(uiSubCategory);
  }

  return uiSubCategory;
}


export const AllProductName: ProductCategory = {
  name: "All Products",
  displayName: "All Products",
  $category: null as any,
  parent: '',
  isParent: false,
  isSubCategory: false,
  children: null as any
};

export const AllProducts: UiCategory = {
  category: AllProductName,
  selected: true,
  uiSubCategories: [],
};

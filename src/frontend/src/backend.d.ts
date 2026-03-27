import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: string;
    name: string;
    description: string;
    stock: bigint;
    vendorId: string;
    image: ExternalBlob;
    price: bigint;
}
export interface ProductInput {
    name: string;
    description: string;
    image?: ExternalBlob;
}
export interface TrendingProduct {
    productId: string;
    purchaseCount: bigint;
}
export interface Vendor {
    id: string;
    productsCount: bigint;
    contact: string;
    revenue: bigint;
    company: string;
}
export interface Order {
    id: string;
    itemId: string;
    paid: boolean;
    orderTime: bigint;
    quantity: bigint;
    customerId: Principal;
    totalPrice: bigint;
}
export interface UserProfile {
    name: string;
    email?: string;
    phone?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    addProductWithoutVendor(input: ProductInput): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkOut(cartId: Principal): Promise<void>;
    deleteProduct(productId: string, vendorId: string): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: string): Promise<Order | null>;
    getProduct(productId: string): Promise<Product | null>;
    getProductsByVendorId(vendorId: string): Promise<Array<Product>>;
    getProductsFromAdmin(): Promise<Array<Product>>;
    getTrendingProducts(): Promise<Array<TrendingProduct>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendor(vendorId: string): Promise<Vendor | null>;
    isCallerAdmin(): Promise<boolean>;
    kvDelete(key: string): Promise<void>;
    kvGet(key: string): Promise<string | null>;
    kvGetAll(): Promise<Array<[string, string]>>;
    kvSet(key: string, value: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}

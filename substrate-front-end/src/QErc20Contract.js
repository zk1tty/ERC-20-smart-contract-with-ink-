import metadata from './config/metadata.json';
import { Abi, ContractPromise } from '@polkadot/api-contract';

// NOTE the apps UI specified these in mega units
export const gasLimit = 3000n * 1000000n;
const qerc20ca = '5H5895Q5QuN9kaW7CqS83udMoDn9aA6kuTnfmaashgwQz72y';

export default function DotErc20Contract(api){
    const abi = new Abi(metadata);
    return new ContractPromise(api, abi, qerc20ca);
}

export function balancesQerc20(balance){
    return `${balance.toString()} QERC20`;
}

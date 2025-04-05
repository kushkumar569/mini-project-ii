import { useRecoilValue } from "recoil";
import { countAtom } from "./text";

function Test() {
    const count = useRecoilValue(countAtom);
    return <>{count}</>;
}

export default Test;

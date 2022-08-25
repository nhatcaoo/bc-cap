pragma solidity ^0.4.17;
interface ERC20 {
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract Reserve{
    //address of owner
    address public owner;
    // tradeFlag = true: allow trading
    bool public tradeFlag;
    //information about custom token
    struct Token{
        address addressToken;
        uint buyRate;
        uint sellRate;
    }
    //address of native token 
    address public constant addressEth = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    Token public token;
    // function Reserve(address _tokenAddress)public{
    //     token.addressToken = _tokenAddress;
    // }
    // function Reserve(bool _tradeFlag, address _tokenAddress, uint _buyRate, uint _sellRate) public{
    //     owner = msg.sender;
        
    //     tradeFlag = _tradeFlag;
        
    //     token.addressToken = _tokenAddress;
    //     token.buyRate = _buyRate;
    //     token.sellRate = _sellRate;
    // }
    function Reserve() public{
        owner = msg.sender;
        tradeFlag = true;
        token.addressToken = 0x685896e286A2A198558eC25Ad766F71665725c85;
        token.buyRate = 1;
        token.sellRate = 2;
    }
    
    function withdraw(address tokenAddress, uint amount) public onlyOwner {
        if (tokenAddress == token.addressToken){
            ERC20(token.addressToken).transfer(msg.sender, amount);
            Transfer(token.addressToken, msg.sender, amount);
            // msg.sender.transfer(amount);
            
        }else{
            msg.sender.transfer(amount);
            Transfer(address(this), msg.sender, amount);
        }
    }
    
    function getExchangeRate(bool isBuy) public view returns(uint){
        if (isBuy){
            return token.sellRate;
        }else{
            return token.buyRate;
        }
    }
    
    function setExchangeRates(uint buyRate, uint sellRate) public onlyOwner{
        token.buyRate = buyRate;
        token.sellRate = sellRate;
    }
    function setTradeFlag(bool value) public onlyOwner{
        tradeFlag = value;
    }
    
    function exchange(bool _isBuy, uint amount) payable public requireFlag returns(uint){
        if (_isBuy){
            require((msg.value) == (amount));
            uint currentTokenBalance = ERC20(token.addressToken).balanceOf(address(this));
            require(currentTokenBalance >= (amount/token.sellRate));
            
            ERC20(token.addressToken).transfer(msg.sender, amount/token.sellRate);
            Transfer(token.addressToken, msg.sender, amount/token.sellRate);
            // return amount*(10**18)/token.sellRate;
        }else{
            
            // require(this.balance >= (amount*token.buyRate));
            // //must transferFrom excecution from token contract before
            // msg.sender.transfer(amount*token.buyRate);  
            // Transfer(address(this), msg.sender, amount*token.buyRate);
            // // return amount*(10**18)*token.buyRate;
            
            require(this.balance >= (amount*token.buyRate));
            ERC20(token.addressToken).transferFrom(msg.sender, this, amount);
            msg.sender.transfer(amount*token.buyRate);
            return amount*token.buyRate;
        }
    }

    function getBalance()public view returns(uint){
        return this.balance;
    }
    
    function getBalanceToken() public view returns(uint){
        uint256 amount = ERC20(token.addressToken).balanceOf(address(this));
        return amount;
        
    }

    function () payable public {}
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    modifier requireFlag(){
        require(tradeFlag == true);
        _;
    }
    
    event Transfer(address indexed from, address indexed to, uint tokens);
}
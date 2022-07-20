
const {useEffect, useState, useRef} = React;
const {Form, InputGroup, Button, Badge, Row, Column, Dropdown, Image} = ReactBootstrap;
import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'
import {
    getFirestore, 
    collection, 
    setDoc, 
    getDocs, 
    getDoc,
    query, 
    where,
    orderBy,
    startAt,
    endAt,
    doc,
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyAlh-Tacj5Ts_LBRAPKOij7ys5J2V_WtBk",
    authDomain: "axiamatic-test.firebaseapp.com",
    projectId: "axiamatic-test",
    storageBucket: "axiamatic-test.appspot.com",
    messagingSenderId: "210074388560",
    appId: "1:210074388560:web:f3e7f00491eb4c771ca955"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsCollection = collection(db, 'tools');

const searchProducts = (searchText) => {
    const q = query(productsCollection, orderBy('name'), startAt(searchText), endAt(searchText + '\uf8ff'))
    return getDocs(q)
    .then((querySnapshot) => {
        const products = [];
        querySnapshot.forEach((doc) => products.push({id: doc.id, ...doc.data()}));
        return products;
    });
};

const getProductById = (id) => {
    const docRef = doc(productsCollection, id)
    return getDoc(docRef)
    .then((docSnap) => docSnap.data());    
};

const addSavedProducts = (tools) => setDoc(doc(db, 'savedTools', 'tester'), {tools});

function App() {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchedProducts, setSearchedProducts] = useState([]);
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (searchText) {
            console.log('searching', searchText);
            try {
                searchProducts(searchText)
                .then((results) => {
                    setSearchedProducts(results);
                    setMenuOpen(results.length > 0);
                });
            } catch (err) {
                console.log(err);
            }
        } else {
            setSearchedProducts([]);
            setMenuOpen(false);
        }
    }, [searchText])
    
    const selectProduct = (productId) => {
        console.log(productId);
        let newSelected = [...selectedProducts];
        if (newSelected.includes(productId)) {
            newSelected.splice(newSelected.indexOf(productId), 1)    
        } else {
            if (newSelected.length === 4) return;
            newSelected.push(productId);
        }
        console.log(newSelected);
        setSelectedProducts(newSelected);
        setMenuOpen(false);
        setSearchText('');
    };
    
    const saveProducts = () => addSavedProducts(selectedProducts);
    
    return  <div style={{padding: 20}} onClick={() => setMenuOpen(false)}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <h1 className="pageTitle">axiamatic</h1>
                    <a href="#" style={{color: 'grey'}}>Exit Setup</a>
                </div>
                <div className='contentContainer'>
                    <div style={{flex: 1, maxWidth: '400px'}}>
                        <div className="boxContainer">
                            <ProductBox productId={selectedProducts[0]} unselectProduct={selectProduct} />
                            <ProductBox productId={selectedProducts[1]} unselectProduct={selectProduct} />
                            <ProductBox productId={selectedProducts[2]} unselectProduct={selectProduct} />
                            <ProductBox productId={selectedProducts[3]} unselectProduct={selectProduct} />
                        </div>
                        <div style={{textAlign: 'center', padding: 30, color: 'grey', fontSize: '14px'}}>
                            {selectedProducts.length} Products Added
                        </div>
                    </div>
                    <div style={{flex: 1, maxWidth: '400px', position: 'relative'}}>
                        <Badge className='pageBadge'>1 of 3</Badge>
                        <h4>Let's add your internal tools</h4>
                        <div style={{fontSize: '14px', paddingBottom: '30px'}}>
                            Search to quickly add products your team uses today.
                            You'll be able to add as many as you need later, but
                            for now, let's add four.
                        </div>
                        <InputGroup>
                            <InputGroup.Text style={{
                                backgroundColor: searchFocused ? 'white' : 'lightgrey',
                                border: searchFocused ? '1px solid #86b7fe' : '1px solid white',
                                borderRight: 'none',
                                paddingRight: '5px',
                                paddingLeft: '5px',
                            }}>
                                <span className='material-icons' style={{color: 'grey'}}>search</span>
                            </InputGroup.Text>
                            <Form.Control
                                placeholder='Search for any software...'
                                className="searchbar" 
                                aria-label="searchbar"
                                value={searchText}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                onChange={(e) => setSearchText(e.target.value)}
                                focused={searchFocused || searchText}
                            />

                        </InputGroup>
                        <Dropdown onSelect={selectProduct} show={menuOpen} close='outside'>
                            <Dropdown.Menu style={{width: '100%', paddingLeft: '10px', paddingRight: '10px'}}>
                                {searchedProducts.map((product) => {
                                    return  <DropdownItem 
                                                id={product.id} 
                                                name={product.name} 
                                                logo={product.logoUrl}
                                                selectProduct={selectProduct}
                                                selected={selectedProducts.includes(product.id)}
                                            />
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Button 
                            style={{width: "100%", marginTop: '20px'}} 
                            size="sm" 
                            variant="primary" 
                            disabled={selectedProducts.length > 0 ? false : true}
                            onClick={saveProducts}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
}

function DropdownItem({selectProduct, id, name, logo, selected}) {
    return  <Dropdown.Item 
                eventKey={id} 
                style={{
                    width: '100%', 
                    borderRadius: '5px', 
                    backgroundColor: selected ? 'lightblue' : 'white',
                    color: selected ? 'white' : 'black',
                    marginTop: '5px',
                    marginBottom: '5px',
                }}
            >
                <img style={{height: '20px', width: '20px'}} src={logo} />
                <span style={{height: '100%', verticalAlign: 'middle', paddingLeft: '10px'}}>{name}</span>
                <span 
                    className='material-icons' 
                    style={{float: 'right', height: '20px', width: '20px', visibility: selected ? 'visible' : 'hidden'}}
                >
                    done
                </span>
            </Dropdown.Item>;
}

function ProductBox({productId, unselectProduct}) {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        if (productId) {
            getProductById(productId)
            .then((result) => {
                console.log(result);
                setProduct(result)
            });
        } else {
            setProduct(null);
        }
    }, [productId])

    if (productId && product) {
        return  <div className="box">
                    <img style={{height: '50px', width: '50px'}} src={product.logoUrl} />
                    <div>{product.name}</div>
                    <div style={{position: 'absolute', bottom: '10px', cursor: 'pointer'}} onClick={() => unselectProduct(productId)}>
                        <span className='material-icons' style={{color: 'red', fontSize: '12px', lineHeight: 1, verticalAlign: 'bottom'}}>
                            close
                        </span>
                        {' '}
                        <span style={{fontSize: '12px', color: 'grey', lineHeight: 1, verticalAlign: 'bottom'}}>
                            Remove
                        </span>
                    </div>
                </div>
    } else {
        return  <div className="box">
                    <button type="button" class="btn btn-light boxButton" disabled>
                        <span className='material-icons' style={{color: 'grey'}}>add</span>
                    </button>
                </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));

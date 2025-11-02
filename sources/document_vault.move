module 0x27a372ccab82a458ad1185bd3a99d4c0d0a7168b1b19becef591a8e6b7d738d5::vault {
    use std::signer;
    use std::vector;

    /// Each document is represented by its IPFS CID bytes
    struct Document has store {
        hash: vector<u8>, // Store IPFS CID as a byte vector
    }

    /// The resource storing all documents for an account
    struct UserDocuments has key {
        docs: vector<Document>,
    }

    /// Initialize resource storage for an account, if not done yet
    public entry fun init(account: &signer) {
        move_to(account, UserDocuments { docs: vector::empty<Document>() });
    }

    /// Add a document for the sender's account
    public entry fun add_document(account: &signer, hash: vector<u8>) acquires UserDocuments {
        let user_docs = borrow_global_mut<UserDocuments>(signer::address_of(account));
        vector::push_back(&mut user_docs.docs, Document { hash });
    }

    /// Get all documents for an account
    public fun get_document_hashes(addr: address): vector<vector<u8>> acquires UserDocuments {
    let user_docs = borrow_global<UserDocuments>(addr);
    let hashes = vector::empty<vector<u8>>();
    let docs_ref = &user_docs.docs;
    let len = vector::length(docs_ref);
    let mut_i = 0;
    while (mut_i < len) {
        let doc_ref = vector::borrow(docs_ref, mut_i);
        vector::push_back(&mut hashes, doc_ref.hash);
        mut_i = mut_i + 1;
    };
    hashes
}
}


